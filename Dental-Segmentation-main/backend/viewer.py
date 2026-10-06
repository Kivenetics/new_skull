import sys
import os
from functools import partial

import numpy as np
import nrrd
import vtk
from vtkmodules.util import numpy_support
from PySide6.QtWidgets import (
    QApplication, QWidget, QHBoxLayout, QVBoxLayout,
    QListWidget, QListWidgetItem, QCheckBox,
    QPushButton, QFileDialog, QLabel
)
from PySide6.QtCore import Qt
from vtkmodules.qt.QVTKRenderWindowInteractor import QVTKRenderWindowInteractor

BASE_DIR  = os.path.dirname(os.path.abspath(__file__))

LABELS = {
    1: "masseter_muscle",
    2: "temporal_muscle",
    3: "lateral_pterygoid_muscle",
    4: "medial_pterygoid_muscle",
    5: "eyeball",
    6: "brain",
    7: "skull",
    8: "mandible",
    9: "rachis",
}

COLORS = [
    (0.9, 0.4, 0.4),
    (0.4, 0.9, 0.4),
    (0.4, 0.4, 0.9),
    (0.9, 0.9, 0.4),
    (0.9, 0.4, 0.9),
    (0.4, 0.9, 0.9),
    (0.95, 0.9, 0.85),
    (0.8, 0.6, 0.4),
    (0.6, 0.6, 0.6),
]


class SegmentationViewer(QWidget):
    def __init__(self, nrrd_file: str):
        super().__init__()
        self.setWindowTitle(f"Segmentation Viewer — {os.path.basename(nrrd_file)}")
        self.nrrd_file = nrrd_file

        # Load data
        data, header = nrrd.read(nrrd_file)
        self.data = np.asarray(data)

        self.spacing = [1.0, 1.0, 1.0]
        if "space directions" in header:
            dirs = header["space directions"]
            sp = [np.linalg.norm(v) for v in dirs if not np.all(v == 0)]
            if len(sp) == 3:
                self.spacing = sp

        print(f"Loaded: {nrrd_file}")
        print(f"Shape: {self.data.shape}, Spacing: {self.spacing}")
        print(f"Unique labels: {np.unique(self.data)}")

        self._init_ui()

    def _init_ui(self):
        main_layout = QHBoxLayout(self)

        # ── Left panel ───────────────────────────────────────────────────
        left_panel = QVBoxLayout()

        title = QLabel("<b>Segments</b>")
        left_panel.addWidget(title)

        self.list_widget = QListWidget()
        self.list_widget.setMaximumWidth(250)
        left_panel.addWidget(self.list_widget)

        # Toggle all buttons
        btn_show_all = QPushButton("Show All")
        btn_hide_all = QPushButton("Hide All")
        btn_show_all.clicked.connect(lambda: self._set_all_visibility(True))
        btn_hide_all.clicked.connect(lambda: self._set_all_visibility(False))
        left_panel.addWidget(btn_show_all)
        left_panel.addWidget(btn_hide_all)

        # Export button
        export_btn = QPushButton("Export Visible as STL")
        export_btn.clicked.connect(self.export_visible_segments)
        left_panel.addWidget(export_btn)

        # Export each segment separately
        export_all_btn = QPushButton("Export Each Segment (STL)")
        export_all_btn.clicked.connect(self.export_each_segment)
        left_panel.addWidget(export_all_btn)

        main_layout.addLayout(left_panel)

        # ── VTK panel ────────────────────────────────────────────────────
        self.vtk_widget = QVTKRenderWindowInteractor(self)
        main_layout.addWidget(self.vtk_widget)

        self.renderer = vtk.vtkRenderer()
        self.renderer.SetBackground(0.1, 0.1, 0.1)
        self.vtk_widget.GetRenderWindow().AddRenderer(self.renderer)

        style = vtk.vtkInteractorStyleTrackballCamera()
        self.vtk_widget.SetInteractorStyle(style)

        self.actors     = {}
        self.checkboxes = {}
        self._build_segments()
        self._build_ui()

        self.renderer.ResetCamera()
        self.vtk_widget.Initialize()
        self.vtk_widget.Start()

    def _build_segments(self):
        for label, name in LABELS.items():
            mask = (self.data == label).astype(np.uint8)
            if mask.sum() == 0:
                print(f"  Skipping label {label} ({name}): no voxels")
                continue

            vtk_array = numpy_support.numpy_to_vtk(
                mask.ravel(order="F"), deep=True,
                array_type=vtk.VTK_UNSIGNED_CHAR
            )
            image = vtk.vtkImageData()
            image.SetDimensions(mask.shape)
            image.SetSpacing(self.spacing)
            image.GetPointData().SetScalars(vtk_array)

            mc = vtk.vtkMarchingCubes()
            mc.SetInputData(image)
            mc.SetValue(0, 0.5)
            mc.Update()

            if mc.GetOutput().GetNumberOfPoints() == 0:
                print(f"  Skipping label {label} ({name}): marching cubes empty")
                continue

            smoother = vtk.vtkSmoothPolyDataFilter()
            smoother.SetInputConnection(mc.GetOutputPort())
            smoother.SetNumberOfIterations(20)
            smoother.SetRelaxationFactor(0.1)
            smoother.FeatureEdgeSmoothingOff()
            smoother.BoundarySmoothingOn()
            smoother.Update()

            normals = vtk.vtkPolyDataNormals()
            normals.SetInputConnection(smoother.GetOutputPort())
            normals.ConsistencyOn()
            normals.SplittingOff()
            normals.Update()

            mapper = vtk.vtkPolyDataMapper()
            mapper.SetInputConnection(normals.GetOutputPort())
            mapper.ScalarVisibilityOff()

            actor = vtk.vtkActor()
            actor.SetMapper(mapper)
            actor.GetProperty().SetColor(COLORS[(label - 1) % len(COLORS)])
            actor.GetProperty().SetOpacity(1.0)
            actor.VisibilityOn()

            self.renderer.AddActor(actor)
            self.actors[label] = actor
            print(f"  Loaded label {label} ({name})")

    def _build_ui(self):
        for label, name in LABELS.items():
            if label not in self.actors:
                continue
            cb = QCheckBox(name)
            cb.setChecked(True)
            cb.stateChanged.connect(partial(self._toggle_visibility, label))
            self.checkboxes[label] = cb

            item = QListWidgetItem()
            item.setSizeHint(cb.sizeHint())
            self.list_widget.addItem(item)
            self.list_widget.setItemWidget(item, cb)

    def _toggle_visibility(self, label, state):
        self.actors[label].SetVisibility(state == Qt.CheckState.Checked.value)
        self.vtk_widget.GetRenderWindow().Render()

    def _set_all_visibility(self, visible: bool):
        for label, actor in self.actors.items():
            actor.SetVisibility(visible)
            if label in self.checkboxes:
                self.checkboxes[label].setChecked(visible)
        self.vtk_widget.GetRenderWindow().Render()

    def export_visible_segments(self):
        filename, _ = QFileDialog.getSaveFileName(
            self, "Save STL", "visible_segments.stl", "STL Files (*.stl)"
        )
        if not filename:
            return

        append = vtk.vtkAppendPolyData()
        count  = 0
        for actor in self.actors.values():
            if actor.GetVisibility():
                pd = actor.GetMapper().GetInputAlgorithm().GetOutput()
                if pd and pd.GetNumberOfPoints() > 0:
                    append.AddInputData(pd)
                    count += 1

        if count == 0:
            print("No visible segments to export.")
            return

        cleaner = vtk.vtkCleanPolyData()
        cleaner.SetInputConnection(append.GetOutputPort())
        cleaner.Update()

        writer = vtk.vtkSTLWriter()
        writer.SetFileName(filename)
        writer.SetInputConnection(cleaner.GetOutputPort())
        writer.Write()
        print(f"Exported {count} segments to {filename}")

    def export_each_segment(self):
        """Export each visible segment as a separate STL file."""
        folder = QFileDialog.getExistingDirectory(self, "Select Output Folder")
        if not folder:
            return

        for label, actor in self.actors.items():
            if not actor.GetVisibility():
                continue
            pd = actor.GetMapper().GetInputAlgorithm().GetOutput()
            if pd and pd.GetNumberOfPoints() > 0:
                name     = LABELS.get(label, f"label_{label}")
                out_path = os.path.join(folder, f"{name}.stl")
                writer   = vtk.vtkSTLWriter()
                writer.SetFileName(out_path)
                writer.SetInputData(pd)
                writer.Write()
                print(f"Exported {name} → {out_path}")


def launch_viewer(nrrd_file: str):
    """Entry point — can be called programmatically."""
    app = QApplication.instance() or QApplication(sys.argv)
    viewer = SegmentationViewer(nrrd_file)
    viewer.resize(1400, 900)
    viewer.show()
    app.exec()


if __name__ == "__main__":
    default_file = os.path.join(BASE_DIR, "output", "output_seg.nrrd")
    nrrd_path = sys.argv[1] if len(sys.argv) > 1 else default_file
    launch_viewer(nrrd_path)
