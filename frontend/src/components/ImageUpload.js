import { useState, useRef } from "react";
import axios from "axios";
import { Upload, X, ImageIcon } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ImageUpload({ images = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("File must be under 10MB."); return; }
    setError("");
    setUploading(true);
    setProgress(0);

    try {
      // Get signature from backend
      const sigRes = await axios.get(`${API}/cloudinary/signature?folder=properties`);
      const { signature, timestamp, cloud_name, api_key, folder } = sigRes.data;

      // Upload directly to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", api_key);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        formData,
        { onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)) }
      );

      onChange([...images, uploadRes.data.secure_url]);
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = (idx) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: .8, display: "block", marginBottom: 8 }}>
        PROPERTY IMAGES ({images.length}/5)
      </label>

      {/* Preview */}
      {images.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {images.map((url, i) => (
            <div key={i} style={{ position: "relative", width: 80, height: 80 }}>
              <img src={url} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10, border: "1.5px solid #EDE5D5" }} />
              <button onClick={() => removeImage(i)}
                style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, background: "#C84B31", border: "none", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }} data-testid={`remove-img-${i}`}>
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {images.length < 5 && (
        <div>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} data-testid="image-file-input" />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", border: "1.5px dashed #DDD5C5", borderRadius: 10, background: "#FEFCF7", cursor: uploading ? "not-allowed" : "pointer", fontSize: 13, color: "#666", fontFamily: "inherit", width: "100%", justifyContent: "center" }} data-testid="upload-btn">
            {uploading ? (
              <>
                <div style={{ width: 140, height: 6, background: "#EDE5D5", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: "#C84B31", borderRadius: 3, transition: "width .2s" }} />
                </div>
                <span>Uploading {progress}%</span>
              </>
            ) : (
              <>
                <Upload size={16} color="#C84B31" />
                <span>Upload Image</span>
                <span style={{ fontSize: 11, color: "#BBB" }}>JPG/PNG, max 10MB</span>
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div style={{ fontSize: 12, color: "#C84B31", marginTop: 6 }}>⚠️ {error}</div>
      )}
    </div>
  );
}
