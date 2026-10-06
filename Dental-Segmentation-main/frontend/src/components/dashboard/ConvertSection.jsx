import API from "../../api";

export default function ConvertSection() {
  const handleConvert = async () => {
    const res = await API.post("/convert");
    alert("Converted: " + res.data.output);
  };

  return (
    <div className="glass-card p-6 border-l-4 border-l-blue">
      <h2 className="text-blue font-display text-sm tracking-widest uppercase mb-4">
        02 Reorientation & Processing
      </h2>
      <button
        className="btn-primary w-full shadow-blue-500/20"
        onClick={handleConvert}
      >
        Begin Conversion
      </button>
    </div>
  );
}
