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
            |-- GrantsPanel.js
                <GrantsTable/>
                   
			
			
		Commom
            map
                |-- ElemDrawManager.js
                |-- EleInfoWindows.js
                |-- ElemPolygon.js
                |-- ElemPopupOverlay.js
                |-- MapControllers.js
                |-- MapContent.js
                    <ElemMap/>
                    <ElemDrawManager/>
                    <ElemMarker/>
                    <ElemPopupOverlay/>
                
			|-- MenuAppBarr.js
            

            |-- MapContainer.js
                <MapContent />
                <MapControllers />

                