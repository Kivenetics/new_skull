import API from "../../api";

export default function InferenceSection({ setJobId }) {
  const handleInfer = async () => {
    const res = await API.post("/infer", {});
    setJobId(res.data.job_id);
  };

  return (
    <div className="glass-card p-6 border-l-4 border-l-blue">
      <h2 className="text-blue font-display text-sm tracking-widest uppercase mb-4">
        3 Start Inference
      </h2>
      <button
        className="btn-primary w-full shadow-blue-500/20"
        onClick={handleInfer}
      >
        Begin Inference
      </button>
    </div>
  );
}
