import { useRef, useEffect, useState } from "react";

/**
 * Pontos do DF com cobertura Street View conhecida, sorteados a cada abertura do site.
 */
const LOCATIONS = [
    { lat: -15.7331605, lng: -47.886387,  descricao: "Park Deck Norte" },
    { lat: -15.6991739, lng: -47.8295777, descricao: "Torre de TV Digital" },
    { lat: -15.7603064, lng: -48.0818471, descricao: "Floresta Nacional de Brasília" },
    { lat: -15.8325514, lng: -47.8476695, descricao: "Lago Paranoá" },
    { lat: -15.7974116, lng: -47.812143,  descricao: "Parque Dom Bosco" },
    { lat: -15.794565,  lng: -47.77701,   descricao: "Panteão da Pátria" },
    // Orla do Lago Paranoá — coordenadas exatas de imagens oficiais do Google (verificadas em 22/10/2026)
    { lat: -15.8186446, lng: -47.8845031, descricao: "Setor de Clubes Sul" },
    { lat: -15.7867300, lng: -47.8397335, descricao: "Concha Acústica" },
    { lat: -15.8009129, lng: -47.7996563, descricao: "Ermida Dom Bosco" },
    { lat: -15.7879410, lng: -47.7813926, descricao: "Barragem do Paranoá" },
    { lat: -15.7737054, lng: -47.8530348, descricao: "Clube do Congresso" },
    // Fotos 360° de usuários (usuario: true) — heading = direção inicial da câmera, tirada do link
    { lat: -15.6060899, lng: -47.9428312, descricao: "Cerrado — Parque Nacional (© Mario Magela)", usuario: true, heading: 321 },
    { lat: -15.5883545, lng: -48.0441409, descricao: "Cerrado (© Pedrão)", usuario: true, heading: 34 },
];

const MAX_CANDIDATES = 3;     // quantos pontos tentar na consulta de metadados
const METADATA_MS    = 2500;  // tempo máximo de cada consulta de metadados
const TILES_MS       = 5000;  // tempo máximo para os tiles do panorama oculto carregarem
const MIN_TILES      = 4;     // quantidade de tiles com resposta 200 para considerar a imagem carregada
const PAINT_MS       = 400;   // folga após os tiles chegarem para o WebGL desenhar
const PLAY_DEADLINE  = 6000;  // após o login, tempo máximo esperando a checagem terminar
const ROTATE_MS      = 4500;  // duração do giro de 360°
const PITCH          = 25;    // inclinação da câmera em graus (positivo = para cima; mostra mais céu)
const FADE_MS        = 600;

const withTimeout = (promise, ms) => Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
]);

/** Links do Google Maps para conferir o ponto no console — pela imagem (pano) ou pela coordenada. */
// fotos de usuário: o id retornado pela API (CAoS…) não abre no site do Maps — usa a coordenada
const panoLink  = (panoId, point) => (point?.usuario
    ? pointLink(point)
    : `https://www.google.com/maps/@?api=1&map_action=pano&pano=${panoId}`);
const pointLink = ({ lat, lng }) => `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;

/** Aviso no console de um ponto que não abriu, com o link para conferir e decidir se remove. */
const warnNotOpened = (motivo, point, panoId) => console.warn(
    `[Street View] NÃO ABRIU (${motivo}): ${point.descricao}\n` +
    `  ponto da lista : ${point.lat}, ${point.lng}\n` +
    `  link           : ${panoId ? panoLink(panoId, point) : pointLink(point)}`,
);

const INDEX_KEY = "sv-intro-index";

/** Índice do próximo ponto da lista — percorre os pontos em sequência, um por abertura do site. */
const readIndex = () => {
    try { return (parseInt(localStorage.getItem(INDEX_KEY), 10) || 0) % LOCATIONS.length; }
    catch (_) { return Math.floor(Math.random() * LOCATIONS.length); }
};
const writeIndex = i => {
    try { localStorage.setItem(INDEX_KEY, String(i % LOCATIONS.length)); } catch (_) {}
};

/**
 * Consulta os metadados do Street View (gratuito) e retorna o primeiro panorama disponível,
 * a partir do próximo ponto da lista. Pontos comuns buscam só imagens oficiais do Google; pontos
 * com `usuario: true` buscam a foto 360° de usuário mais próxima (raio menor). Fotos de usuário
 * só abrem pela busca por coordenada — pelo id do link a API responde ZERO_RESULTS.
 * @param {() => boolean} isCancelled - interrompe a busca (ex.: desmontagem do StrictMode) sem avançar o índice
 * @param {(point: object) => void} onTry - avisa qual ponto está sendo consultado
 * @returns {Promise<{ panoId: string, point: object, latLng: object, copyright: string }|null>}
 */
async function findPanorama(isCancelled, onTry) {
    const g = window.google?.maps;
    if (!g?.StreetViewService) return null;
    const service = new g.StreetViewService();
    const source  = g.StreetViewSource.GOOGLE ?? g.StreetViewSource.OUTDOOR;
    const start   = readIndex();

    for (let k = 0; k < MAX_CANDIDATES; k++) {
        const index = (start + k) % LOCATIONS.length;
        const { lat, lng, usuario } = LOCATIONS[index];
        onTry(LOCATIONS[index]);
        try {
            const { data } = await withTimeout(service.getPanorama(usuario
                ? { location: { lat, lng }, radius: 50 }
                : { location: { lat, lng }, radius: 100, sources: [source] },
            ), METADATA_MS);
            if (isCancelled()) return null;
            writeIndex(index + 1);   // próxima abertura começa no ponto seguinte
            if (data?.location?.pano) {
                return {
                    panoId: data.location.pano,
                    point: LOCATIONS[index],
                    latLng: data.location.latLng?.toJSON(),
                    copyright: data.copyright ?? "",
                };
            }
        } catch (e) {
            if (isCancelled()) return null;
            writeIndex(index + 1);
            // sem cobertura, cota excedida ou timeout → próximo ponto
            warnNotOpened(`sem imagem — ${e.message}`, LOCATIONS[index]);
        }
    }
    return null;
}

/**
 * Cria o panorama dentro de um container invisível (opacity 0) e aguarda os tiles carregarem.
 * O evento `tiles_loaded` não dispara na API atual (3.66), então os tiles são contados pela
 * Resource Timing API: requisições a `streetviewpixels-pa.googleapis.com/v1/tile` deste panorama
 * (imagens oficiais) ou a `lh3.googleusercontent.com/gpms-…` (fotos de usuário).
 * Só resolve `ok: true` se o status for OK e os tiles chegarem a tempo — evita a tela preta.
 * Qualquer tile com erro (ex.: 429 do servidor de fotos de usuário) descarta o panorama na hora,
 * para não exibir a imagem com pedaços pretos.
 * @returns {Promise<{ ok: boolean, motivo?: string }>}
 */
function preloadPanorama(container, panoId, panoramaRef, heading) {
    return new Promise(resolve => {
        const g = window.google.maps;
        const createdAt = performance.now();

        // Observa antes de criar o panorama para não perder as primeiras requisições
        let tilesOk = 0;
        let paintTimer = null;
        const observer = new PerformanceObserver(list => {
            for (const e of list.getEntries()) {
                const isTile = (e.name.includes("streetviewpixels") && e.name.includes(panoId))
                    || (e.name.includes("googleusercontent.com/gpms") && e.startTime >= createdAt);
                if (!isTile) continue;
                // responseStatus: Chrome/Edge 109+; nos demais navegadores conta a requisição concluída
                if (e.responseStatus >= 400) return settle(false, `servidor recusou a imagem (${e.responseStatus})`);
                const ok = e.responseStatus === undefined ? e.responseEnd > 0 : e.responseStatus === 200;
                if (ok) tilesOk += 1;
            }
            if (tilesOk >= MIN_TILES && !paintTimer) {
                paintTimer = setTimeout(() => settle(pano.getStatus() === "OK", "status do panorama"), PAINT_MS);
            }
        });
        observer.observe({ type: "resource", buffered: false });

        const pano = new g.StreetViewPanorama(container, {
            pano: panoId,
            pov: { heading, pitch: PITCH },
            zoom: 1,
            addressControl: false,
            linksControl: false,
            panControl: false,
            enableCloseButton: true,
            zoomControl: false,
            fullscreenControl: false,
            motionTracking: false,
            motionTrackingControl: false,
        });
        panoramaRef.current = pano;

        let settled = false;
        function settle(ok, motivo) {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            clearTimeout(paintTimer);
            observer.disconnect();
            g.event.removeListener(statusL);
            resolve({ ok, motivo });
        }
        const timer   = setTimeout(() => settle(false, "imagem não carregou a tempo"), TILES_MS);
        const statusL = pano.addListener("status_changed", () => {
            if (pano.getStatus() !== "OK") settle(false, `status ${pano.getStatus()}`);
        });
    });
}

/**
 * Abertura do site com Street View de um ponto do DF.
 * A disponibilidade é testada de forma invisível assim que o componente monta;
 * se o panorama não estiver pronto, chama `onDone` sem exibir nada (segue para a animação padrão).
 * @param {{ play: boolean, onDone: (played: boolean) => void }} props
 *   - play   : libera a exibição (ex.: login concluído)
 *   - onDone : chamado ao terminar o giro ou fechar (`played = true`), ou quando o Street View
 *              não estiver disponível (`played = false` → segue para a animação)
 */
const ElemStreetView = ({ play, onDone }) => {
    const ref         = useRef(null);
    const panoramaRef = useRef(null);
    const foundRef    = useRef(null);   // panorama encontrado — exibido no console ao tocar
    const tryingRef   = useRef(null);   // ponto em consulta — avisado no console se o tempo esgotar
    const onDoneRef   = useRef(onDone);
    onDoneRef.current = onDone;
    // probing → ready → playing → fading → done   |   probing → failed
    const [phase, setPhase] = useState("probing");

    const destroyPanorama = () => {
        if (!panoramaRef.current) return;
        try {
            window.google.maps.event.clearInstanceListeners(panoramaRef.current);
            panoramaRef.current.setVisible(false);
        } catch (_) {}
        panoramaRef.current = null;
    };

    // Checagem invisível: metadados + pré-carregamento dos tiles
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const found = await findPanorama(() => cancelled, point => { tryingRef.current = { point }; });
                if (cancelled) return;
                if (!found || !ref.current) return setPhase("failed");
                foundRef.current = found;
                tryingRef.current = { point: found.point, panoId: found.panoId };
                const { ok, motivo } = await preloadPanorama(ref.current, found.panoId, panoramaRef, found.point.heading ?? 0);
                // tryingRef nulo → o tempo após o login já esgotou e o aviso já saiu
                if (cancelled || !tryingRef.current) return;
                tryingRef.current = null;
                if (!ok) warnNotOpened(motivo, found.point, found.panoId);
                setPhase(p => (p === "probing" ? (ok ? "ready" : "failed") : p));
            } catch (_) {
                if (!cancelled) setPhase("failed");
            }
        })();
        return () => {
            cancelled = true;
            destroyPanorama();
        };
    }, []);

    // Login concluído mas a checagem ainda não terminou: não segura a abertura por muito tempo
    useEffect(() => {
        if (!play || phase !== "probing") return;
        const t = setTimeout(() => {
            if (tryingRef.current) warnNotOpened("tempo esgotado", tryingRef.current.point, tryingRef.current.panoId);
            tryingRef.current = null;
            setPhase("failed");
        }, PLAY_DEADLINE);
        return () => clearTimeout(t);
    }, [play, phase]);

    useEffect(() => {
        if (play && phase === "ready") setPhase("playing");
    }, [play, phase]);

    // Giro de 360° — encerra antes se o panorama falhar ou o usuário fechar
    useEffect(() => {
        if (phase !== "playing" || !panoramaRef.current) return;
        const pano  = panoramaRef.current;
        if (foundRef.current) {
            const { point, latLng, panoId, copyright } = foundRef.current;
            console.log(
                `[Street View] exibindo: ${point.descricao}${point.usuario ? " [foto de usuário]" : ""}\n` +
                `  ponto da lista : ${point.lat}, ${point.lng}\n` +
                `  imagem (real)  : ${latLng ? `${latLng.lat}, ${latLng.lng}` : "—"}\n` +
                `  autor          : ${copyright || "—"}\n` +
                `  pano id        : ${panoId}\n` +
                `  link           : ${panoLink(panoId, point)}`,
            );
        }
        const heading0 = foundRef.current?.point.heading ?? 0;
        const start = performance.now();
        let raf;
        const step = now => {
            const t = Math.min((now - start) / ROTATE_MS, 1);
            pano.setPov({ heading: heading0 + t * 360, pitch: PITCH });
            if (t < 1) raf = requestAnimationFrame(step);
            else setPhase("fading");
        };
        raf = requestAnimationFrame(step);
        const closeL  = pano.addListener("closeclick", () => setPhase("fading"));
        const statusL = pano.addListener("status_changed", () => {
            if (pano.getStatus() !== "OK") setPhase("fading");
        });
        return () => {
            cancelAnimationFrame(raf);
            window.google.maps.event.removeListener(closeL);
            window.google.maps.event.removeListener(statusL);
        };
    }, [phase]);

    useEffect(() => {
        if (phase !== "fading") return;
        const t = setTimeout(() => setPhase("done"), FADE_MS);
        return () => clearTimeout(t);
    }, [phase]);

    useEffect(() => {
        if (phase !== "done" && phase !== "failed") return;
        destroyPanorama();
        onDoneRef.current?.(phase === "done");
    }, [phase]);

    if (phase === "done" || phase === "failed") return null;

    const visible = phase === "playing";
    return (
        <div
            ref={ref}
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 3,
                // opacity 0 (e não display:none) para o panorama renderizar enquanto é testado
                opacity: visible ? 1 : 0,
                pointerEvents: visible ? "auto" : "none",
                transition: `opacity ${FADE_MS}ms ease-in-out`,
            }}
        />
    );
};

export default ElemStreetView;
