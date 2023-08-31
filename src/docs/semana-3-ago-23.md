Organização

App.js

	MainFlow
        Analyse.js
            <MapPanel/>
            <GeneralAnalysePanel />
            <SurfaceAnalysePanel />
            <GrantsPanel />
            General
            |-- MapPanel.js
                <MapContainer />
            |--WellTypePaper.js
            |-- GeneralAnalysePanel.js
                <CoordPaper/>
                <SearchPaper/>
                <NumberOfGrantsChart>
            |-- GrantsPanel.js
                <GrantsTable/>
                
        
        
            Commom
                chart-js (folder)
                map (folder)
                    |-- ElemDrawManager.js
                    |-- EleInfoWindows.js
                    |-- ElemPolygon.js
                        <ElemPolygonInfowindow>
                            <HTMLPolygonContent/>
                    |-- ElemPopupOverlay.js
                    |-- MapControllers.js
                    |-- MapContent.js
                        <ElemMap/>
                        <ElemDrawManager/>
                        <ElemMarker/>
                        <ElemPopupOverlay/>
                CoordPaper.js (file)  
                GrantsTable.js (file)  
                |-- MenuAppBarr.js
                

                |-- MapContainer.js
                    <MapContent />
                        const [map, setMap]
                        <ElemPolygon/>
                            
                    <MapControllers />

                    <ElemPolygon>



<Analyse/>
    <MapPanel/>
        <MapContainer/>
            <MapContent>
                <Marker/>
    <GeneralAnalysePanel/>
        <CoordPaper/>
        <SearchPaper/>
        <NumberOfGrantsChart/>

    