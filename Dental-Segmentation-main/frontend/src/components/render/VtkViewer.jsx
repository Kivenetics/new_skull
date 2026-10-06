import { useEffect, useRef, useCallback } from 'react';

// VTK.js imports
import '@kitware/vtk.js/Rendering/Profiles/Volume';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
import vtkXMLImageDataReader from '@kitware/vtk.js/IO/XML/XMLImageDataReader';

// Label → color mapping for 9 anatomical structures
const LABEL_COLORS = {
    1: { name: 'Masseter Muscle', rgb: [0.90, 0.50, 0.30] },
    2: { name: 'Lateral Pterygoid', rgb: [0.20, 0.70, 0.90] },
    3: { name: 'Medial Pterygoid', rgb: [0.30, 0.90, 0.40] },
    4: { name: 'Temporal Muscle', rgb: [0.90, 0.20, 0.30] },
    5: { name: 'Cervical Muscles', rgb: [0.95, 0.85, 0.40] },
    6: { name: 'Soft Tissue', rgb: [1.00, 0.80, 0.70] },
    7: { name: 'Skull', rgb: [0.90, 0.90, 0.85] },
    8: { name: 'Mandible', rgb: [0.80, 0.80, 0.70] },
    9: { name: 'TMJ Disc', rgb: [0.60, 0.30, 0.80] },
};

export { LABEL_COLORS };

export default function VtkViewer({ visibleLabels, onLoaded }) {
    const onLoadedRef = useRef(onLoaded);
    onLoadedRef.current = onLoaded;
    const containerRef = useRef(null);
    const vtkContextRef = useRef(null);

    // Build / rebuild the piecewise opacity function whenever label visibility changes
    const updateOpacity = useCallback(() => {
        const ctx = vtkContextRef.current;
        if (!ctx) return;
        const { ofun, renderWindow } = ctx;

        ofun.removeAllPoints();
        ofun.addPoint(0, 0.0); // background is always transparent

        for (let label = 1; label <= 9; label++) {
            const visible = visibleLabels.has(label);
            // Small epsilon offsets ensure a sharp step function per label
            ofun.addPoint(label - 0.5, 0.0);
            ofun.addPoint(label, visible ? 1.0 : 0.0);
            ofun.addPoint(label + 0.49, 0.0);
        }
        renderWindow.render();
    }, [visibleLabels]);

    // Initialise VTK pipeline once
    useEffect(() => {
        if (!containerRef.current) return;

        const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
            rootContainer: containerRef.current,
            background: [0.08, 0.08, 0.12],
        });

        const renderer = fullScreenRenderer.getRenderer();
        const renderWindow = fullScreenRenderer.getRenderWindow();

        // ---- colour transfer function -------------------------------------------
        const ctfun = vtkColorTransferFunction.newInstance();
        ctfun.addRGBPoint(0, 0, 0, 0); // background black / transparent
        Object.entries(LABEL_COLORS).forEach(([labelStr, { rgb }]) => {
            const label = Number(labelStr);
            ctfun.addRGBPoint(label, rgb[0], rgb[1], rgb[2]);
        });

        // ---- opacity piecewise function -----------------------------------------
        const ofun = vtkPiecewiseFunction.newInstance();

        // ---- volume mapper -------------------------------------------------------
        const mapper = vtkVolumeMapper.newInstance();
        mapper.setSampleDistance(1.0);

        // ---- volume actor --------------------------------------------------------
        const actor = vtkVolume.newInstance();
        actor.setMapper(mapper);
        actor.getProperty().setRGBTransferFunction(0, ctfun);
        actor.getProperty().setScalarOpacity(0, ofun);
        actor.getProperty().setInterpolationTypeToNearest(); // keeps label boundaries sharp
        actor.getProperty().setScalarOpacityUnitDistance(0, 1.0);

        // ---- load data -----------------------------------------------------------
        const reader = vtkXMLImageDataReader.newInstance({ fetchGzip: false });
        reader.setUrl('/output_seg.vti', { loadData: true }).then(() => {
            const imageData = reader.getOutputData(0);
            mapper.setInputData(imageData);
            renderer.addVolume(actor);
            renderer.resetCamera();
            renderWindow.render();
            if (onLoadedRef.current) onLoadedRef.current();
        });

        vtkContextRef.current = { fullScreenRenderer, renderer, renderWindow, ofun, actor };

        return () => {
            fullScreenRenderer.delete();
            vtkContextRef.current = null;
        };
    }, []);

    // React to visibility changes
    useEffect(() => {
        updateOpacity();
    }, [visibleLabels, updateOpacity]);

    return (
        <div
            ref={containerRef}
            style={{ width: '100%', height: '100%', position: 'relative' }}
        />
    );
}
