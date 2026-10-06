import os
import nrrd
import numpy as np

file_path = os.path.join(os.path.dirname(__file__), "output", "output_seg.nrrd")
if not os.path.exists(file_path):
    print("File not found:", file_path)
    exit(1)

print("Loading", file_path)
data, header = nrrd.read(file_path)
print("Shape:", data.shape)
print("Unique Labels:", np.unique(data).tolist())
print("Success!")
