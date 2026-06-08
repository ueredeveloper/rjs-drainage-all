import ReactDOM from "react-dom/client";
import { useEffect } from "react";
import {
  findAllPointsInRectangle,
  findAllPointsInPolygon,
  findAllPointsInCircle,
} from "../../../services/geolocation";
import {
  calculateCircleArea,
  calculatePolygonArea,
  calculatePolylineLength,
  calculateRectangleArea,
} from "../../../tools";
import { useData } from "../../../hooks/analyse-hooks";
import InfoWindowContent from "./infowindow/InfoWindowContent";

const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const BUTTONS = [
  {
    mode: null,
    title: "Parar desenho (Esc)",
    svg: `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M4 0l16 12.28-6.95 1.17 4.32 8.82-3.6 1.73-4.35-8.88-5.42 4.7z"/></svg>`,
  },
  {
    mode: "marker",
    title: "Marcador",
    svg: `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  },
  {
    mode: "circle",
    title: "Círculo: clique e arraste",
    svg: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/></svg>`,
  },
  {
    mode: "polygon",
    title: "Polígono: clique nos vértices, duplo-clique para finalizar",
    svg: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12,2 21,8 18,20 6,20 3,8"/></svg>`,
  },
  {
    mode: "rectangle",
    title: "Retângulo: clique e arraste",
    svg: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="6" width="18" height="12" rx="1"/></svg>`,
  },
  {
    mode: "polyline",
    title: "Linha: clique nos pontos, duplo-clique para finalizar",
    svg: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3,17 8,9 13,14 18,6 21,10"/></svg>`,
  },
];

/**
 * Gerencia o desenho de formas no mapa e a interação com InfoWindows.
 * Implementado sem DrawingManager (depreciado na API v3.65).
 *
 * @component
 * @param {Object} props
 * @param {google.maps.Map} props.map - Instância do Google Maps.
 * @returns {null}
 */
const ElemDrawManager = ({ map }) => {
  const { setMarker, setOverlays } = useData();

  useEffect(() => {
    if (!window.google || !window.google.maps || !map) return;

    let mode = null;
    let points = [];
    let startPoint = null;
    let isDragging = false;
    let lastDragLatLng = null;
    let previewShapes = [];
    let currentInfoWindow = null;

    const toolbar = document.createElement("div");
    toolbar.style.cssText =
      "display:flex;align-items:center;background:#fff;border-radius:2px;" +
      "box-shadow:0 1px 4px rgba(0,0,0,.3);margin:10px;padding:2px;gap:2px;";

    const clearPreview = () => {
      previewShapes.forEach((s) => s.setMap(null));
      previewShapes = [];
    };

    const setMode = (newMode) => {
      if (isDragging) {
        isDragging = false;
        lastDragLatLng = null;
        map.setOptions({ draggable: true });
      }
      mode = newMode;
      clearPreview();
      points = [];
      startPoint = null;
      map.setOptions({
        draggableCursor: newMode ? "crosshair" : null,
        disableDoubleClickZoom: newMode === "polygon" || newMode === "polyline",
      });
      toolbar.querySelectorAll("button").forEach((btn) => {
        const active = btn.dataset.mode === (newMode ?? "");
        btn.style.background = active ? "#d8e8f8" : "#fff";
        btn.style.borderColor = active ? "#4a90d9" : "#ccc";
      });
    };

    const openInfoWindow = (shape, position) => {
      window.dispatchEvent(new Event("close-all-infowindows"));
      if (currentInfoWindow) currentInfoWindow.close();

      setOverlays((prev) => ({
        ...prev,
        shapes: prev.shapes.map((s) =>
          s.id === shape.id ? { ...s, calculoAreaAtivo: false } : s
        ),
      }));

      const container = document.createElement("div");
      const root = ReactDOM.createRoot(container);
      root.render(
        <InfoWindowContent
          shape={{ ...shape, calculoAreaAtivo: false }}
          setOverlays={setOverlays}
        />
      );

      const infoWindow = new window.google.maps.InfoWindow({
        content: container,
        position,
      });
      infoWindow.open(map);
      shape.infoWindow = infoWindow;
      currentInfoWindow = infoWindow;
    };

    const addClickListenerToShape = (shapeObj) => {
      const overlay = shapeObj.draw;
      if (!overlay) return;
      if (shapeObj.listenerClick) {
        window.google.maps.event.removeListener(shapeObj.listenerClick);
      }
      shapeObj.listenerClick = window.google.maps.event.addListener(
        overlay,
        "click",
        (event) => {
          openInfoWindow(
            shapeObj,
            event.latLng ? event.latLng.toJSON() : shapeObj.position
          );
        }
      );
    };

    const finalizeShape = async (type, overlay) => {
      const shape = {
        id: Date.now(),
        type,
        map,
        draw: overlay,
        position: null,
        area: null,
        meters: null,
        markers: [],
        calculoAreaAtivo: true,
      };

      if (type === "circle") {
        const center = overlay.getCenter();
        const radius = overlay.getRadius();
        const bounds = overlay.getBounds();
        shape.position = { lat: bounds.getNorthEast().lat(), lng: center.lng() };
        shape.radius = radius;
        shape.area = calculateCircleArea(radius);
        shape.markers = await findAllPointsInCircle({
          center: { lat: center.lat(), lng: center.lng() },
          radius: parseInt(radius),
        });

        // Re-busca outorgas quando o usuário redimensiona o círculo
        let resizeTimer = null;
        window.google.maps.event.addListener(overlay, "radius_changed", () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(async () => {
            const newCenter = overlay.getCenter();
            const newRadius = overlay.getRadius();
            const newBounds = overlay.getBounds();
            const newMarkers = await findAllPointsInCircle({
              center: { lat: newCenter.lat(), lng: newCenter.lng() },
              radius: parseInt(newRadius),
            });
            setOverlays((prev) => ({
              ...prev,
              shapes: prev.shapes.map((s) =>
                s.id === shape.id
                  ? {
                      ...s,
                      radius: newRadius,
                      area: calculateCircleArea(newRadius),
                      markers: newMarkers,
                      position: { lat: newBounds.getNorthEast().lat(), lng: newCenter.lng() },
                    }
                  : s
              ),
            }));
          }, 800);
        });
      }

      if (type === "polygon") {
        const paths = overlay.getPaths();
        let lat = null, lng = null;
        const serverPolygon = [];
        paths.forEach((path) => {
          path.forEach((pt) => {
            serverPolygon.push([pt.lng(), pt.lat()]);
            if (lat === null || pt.lat() > lat) { lat = pt.lat(); lng = pt.lng(); }
          });
        });
        shape.position = { lat, lng };
        shape.area = calculatePolygonArea(overlay);
        shape.markers = await findAllPointsInPolygon([...serverPolygon, serverPolygon[0]]);
      }

      if (type === "rectangle") {
        const bounds = overlay.getBounds();
        const NE = bounds.getNorthEast();
        const SW = bounds.getSouthWest();
        shape.NE = NE;
        shape.SW = SW;
        shape.position = NE.toJSON();
        shape.area = calculateRectangleArea(bounds);
        shape.markers = await findAllPointsInRectangle(SW.lng(), SW.lat(), NE.lng(), NE.lat());
      }

      if (type === "polyline") {
        const path = overlay.getPath();
        shape.position = path.getAt(path.getLength() - 1).toJSON();
        shape.meters = calculatePolylineLength(overlay);
        shape.markers = {
          subterranea: [], superficial: [], barragem: [],
          lancamento_efluentes: [], lancamento_pluviais: [],
        };
      }

      addClickListenerToShape(shape);
      setOverlays((prev) => ({ ...prev, shapes: [...prev.shapes, shape] }));
    };

    // --- handlers de evento do mapa ---

    const handleClick = async (e) => {
      if (!mode) return;

      if (mode === "marker") {
        setMarker((prev) => ({
          ...prev,
          int_latitude: e.latLng.lat(),
          int_longitude: e.latLng.lng(),
        }));
        setMode(null);
        return;
      }

      if (mode === "polygon" || mode === "polyline") {
        points.push(e.latLng);
        return;
      }

      if (mode === "rectangle") return;
    };

    const handleMouseDown = (e) => {
      if (mode !== "circle" && mode !== "rectangle") return;
      startPoint = e.latLng;
      isDragging = true;
      map.setOptions({ draggable: false });
    };

    // Usa window.mouseup para garantir disparo mesmo com draggable: false
    const handleWindowMouseUp = async () => {
      if (!isDragging) return;
      isDragging = false;
      map.setOptions({ draggable: true });

      if (mode === "circle") {
        if (!startPoint || !lastDragLatLng) { clearPreview(); startPoint = null; lastDragLatLng = null; return; }
        const radius = haversineDistance(
          startPoint.lat(), startPoint.lng(),
          lastDragLatLng.lat(), lastDragLatLng.lng()
        );
        if (radius < 50) { clearPreview(); startPoint = null; lastDragLatLng = null; return; }
        const s = startPoint;
        clearPreview();
        setMode(null);
        startPoint = null; lastDragLatLng = null;
        const circle = new window.google.maps.Circle({
          center: { lat: s.lat(), lng: s.lng() },
          radius,
          map,
          fillColor: "#ffff00",
          fillOpacity: 0.2,
          strokeColor: "#ff0000",
          strokeWeight: 3,
          clickable: true,
          editable: true,
          zIndex: 1,
        });
        await finalizeShape("circle", circle);
        return;
      }

      if (mode === "rectangle") {
        if (!startPoint || !lastDragLatLng) { clearPreview(); startPoint = null; lastDragLatLng = null; return; }
        const s = startPoint, end = lastDragLatLng;
        clearPreview();
        setMode(null);
        startPoint = null; lastDragLatLng = null;
        const SW = new window.google.maps.LatLng(
          Math.min(s.lat(), end.lat()), Math.min(s.lng(), end.lng())
        );
        const NE = new window.google.maps.LatLng(
          Math.max(s.lat(), end.lat()), Math.max(s.lng(), end.lng())
        );
        const rectangle = new window.google.maps.Rectangle({
          bounds: new window.google.maps.LatLngBounds(SW, NE),
          map,
          strokeColor: "#ff0000",
          strokeWeight: 2,
          fillOpacity: 0.1,
          editable: true,
          clickable: true,
        });
        await finalizeShape("rectangle", rectangle);
        return;
      }

      clearPreview();
      startPoint = null;
      lastDragLatLng = null;
    };

    // dblclick é precedido por UM click (que já adicionou o ponto final), então usamos todos os pontos
    const handleDblClick = async (e) => {
      if (mode === "polygon" && points.length >= 3) {
        const finalPts = points;
        setMode(null);
        const polygon = new window.google.maps.Polygon({
          paths: finalPts,
          map,
          strokeColor: "#ff0000",
          strokeWeight: 3,
          fillOpacity: 0.1,
          editable: true,
          clickable: true,
        });
        await finalizeShape("polygon", polygon);
      } else if (mode === "polyline" && points.length >= 2) {
        const finalPts = points;
        setMode(null);
        const polyline = new window.google.maps.Polyline({
          path: finalPts,
          map,
          strokeColor: "#ff0000",
          strokeWeight: 3,
          editable: true,
          clickable: true,
        });
        await finalizeShape("polyline", polyline);
      }
    };

    const handleMouseMove = (e) => {
      if (isDragging) lastDragLatLng = e.latLng;
      if (!mode) return;
      clearPreview();

      if ((mode === "polygon" || mode === "polyline") && points.length > 0) {
        const tempPts = [...points, e.latLng];
        // sempre Polyline no preview — polígono não fecha visualmente até ser finalizado
        const preview = new window.google.maps.Polyline({
          path: tempPts, map,
          strokeColor: "#ff0000", strokeWeight: 1,
          strokeOpacity: 0.7, clickable: false,
        });
        previewShapes = [preview];
      }

      if (mode === "circle" && startPoint) {
        const radius = haversineDistance(
          startPoint.lat(), startPoint.lng(), e.latLng.lat(), e.latLng.lng()
        );
        previewShapes = [
          new window.google.maps.Circle({
            center: startPoint, radius, map,
            fillColor: "#ffff00", fillOpacity: 0.15,
            strokeColor: "#ff0000", strokeWeight: 1,
            strokeOpacity: 0.7, clickable: false,
          }),
        ];
      }

      if (mode === "rectangle" && startPoint) {
        const SW = new window.google.maps.LatLng(
          Math.min(startPoint.lat(), e.latLng.lat()),
          Math.min(startPoint.lng(), e.latLng.lng())
        );
        const NE = new window.google.maps.LatLng(
          Math.max(startPoint.lat(), e.latLng.lat()),
          Math.max(startPoint.lng(), e.latLng.lng())
        );
        previewShapes = [
          new window.google.maps.Rectangle({
            bounds: new window.google.maps.LatLngBounds(SW, NE), map,
            strokeColor: "#ff0000", strokeWeight: 1,
            fillOpacity: 0.05, clickable: false,
          }),
        ];
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mode) setMode(null);
    };

    const clickL = map.addListener("click", handleClick);
    const dblClickL = map.addListener("dblclick", handleDblClick);
    const mouseMoveL = map.addListener("mousemove", handleMouseMove);
    const mouseDownL = map.addListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleWindowMouseUp);
    window.addEventListener("keydown", handleKeyDown);

    BUTTONS.forEach(({ mode: btnMode, title, svg }) => {
      const btn = document.createElement("button");
      btn.dataset.mode = btnMode ?? "";
      btn.title = title;
      btn.innerHTML = svg;
      btn.style.cssText =
        "display:flex;align-items:center;justify-content:center;" +
        "width:26px;height:26px;background:#fff;border:1px solid #ccc;" +
        "border-radius:2px;cursor:pointer;color:#444;padding:0;";
      btn.onmouseenter = () => {
        if (mode !== btnMode) btn.style.background = "#f5f5f5";
      };
      btn.onmouseleave = () => {
        if (mode !== btnMode) btn.style.background = "#fff";
      };
      btn.onclick = () => setMode(btnMode);
      toolbar.appendChild(btn);
    });

    const separator = document.createElement("div");
    separator.style.cssText = "width:1px;height:16px;background:#ddd;margin:0 3px;";
    toolbar.appendChild(separator);

    const clearBtn = document.createElement("button");
    clearBtn.title = "Limpar todas as camadas desenhadas";
    clearBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;
    clearBtn.style.cssText =
      "display:flex;align-items:center;justify-content:center;" +
      "width:26px;height:26px;background:#fff;border:1px solid #ccc;" +
      "border-radius:2px;cursor:pointer;color:#c0392b;padding:0;";
    clearBtn.onmouseenter = () => { clearBtn.style.background = "#fdf0ef"; };
    clearBtn.onmouseleave = () => { clearBtn.style.background = "#fff"; };
    clearBtn.onclick = () => {
      setMode(null);
      window.dispatchEvent(new Event("clear-all-map"));
    };
    toolbar.appendChild(clearBtn);

    map.controls[window.google.maps.ControlPosition.TOP_CENTER].push(toolbar);

    return () => {
      const controls = map.controls[window.google.maps.ControlPosition.TOP_CENTER];
      for (let i = 0; i < controls.getLength(); i++) {
        if (controls.getAt(i) === toolbar) { controls.removeAt(i); break; }
      }
      clearPreview();
      map.setOptions({ draggableCursor: null, disableDoubleClickZoom: false });
      window.google.maps.event.removeListener(clickL);
      window.google.maps.event.removeListener(dblClickL);
      window.google.maps.event.removeListener(mouseMoveL);
      window.google.maps.event.removeListener(mouseDownL);
      window.removeEventListener("mouseup", handleWindowMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
      if (isDragging) map.setOptions({ draggable: true });
    };
  }, [map, setMarker, setOverlays]);

  return null;
};

export default ElemDrawManager;
