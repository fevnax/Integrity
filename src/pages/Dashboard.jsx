import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, Scan, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { analyzeIngredients } from '../services/gemini';
import { saveAnalysis } from '../services/analysisStorage';
import Navbar from '../components/Navbar';
import Spinner from '../components/ui/Spinner';
import '../styles/dashboard.css';

export default function Dashboard() {
    const { user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [image, setImage] = useState(null);
    const [imageDataUrl, setImageDataUrl] = useState(null);
    const [productName, setProductName] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const processFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            toast.warning('Please select a valid image file');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.warning('Image must be under 10MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            setImageDataUrl(e.target.result);
            setImage({
                base64: e.target.result.split(',')[1],
                mimeType: file.type
            });
            setCameraActive(false);
            stopCamera();
        };
        reader.readAsDataURL(file);
    };

    const handleFileSelect = (e) => {
        processFile(e.target.files[0]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        processFile(e.dataTransfer.files[0]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setCameraActive(true);
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            }, 100);
        } catch {
            toast.error('Unable to access camera. Please check permissions.');
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setImageDataUrl(dataUrl);
        setImage({
            base64: dataUrl.split(',')[1],
            mimeType: 'image/jpeg'
        });
        stopCamera();
    };

    const removeImage = () => {
        setImage(null);
        setImageDataUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleAnalyze = async () => {
        if (!image) {
            toast.warning('Please upload or capture an image first');
            return;
        }
        setAnalyzing(true);
        try {
            console.log('[Integrity] Starting analysis...');
            const result = await analyzeIngredients(image.base64, image.mimeType, productName.trim());
            console.log('[Integrity] Analysis result received:', result?.product_name);

            toast.success('Analysis complete!');
            navigate('/analysis/local', {
                state: { analysis: result, imagePreview: imageDataUrl }
            });

            createThumbnail(imageDataUrl, 200).then(thumbnail => {
                saveAnalysis(user.uid, result, thumbnail)
                    .then(id => console.log('[Integrity] Saved to Firestore:', id))
                    .catch(err => console.warn('[Integrity] Firestore save failed:', err.message));
            });
        } catch (err) {
            console.error('[Integrity] Analysis error:', err);
            toast.error(err.message || 'Analysis failed. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    const createThumbnail = (dataUrl, maxSize) => {
        return new Promise((resolve) => {
            if (!dataUrl) { resolve(null); return; }
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ratio = Math.min(maxSize / img.width, maxSize / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.6));
            };
            img.onerror = () => resolve(null);
            img.src = dataUrl;
        });
    };

    return (
        <div className="dashboard-page" id="dashboard-page">
            <Navbar />
            <div className="dashboard-container">
                <div className="dashboard-card glass-card">
                    <div className="dashboard-header">
                        <h1 className="dashboard-title">
                            <Scan size={28} className="dashboard-title-icon" />
                            Ingredient Scanner
                        </h1>
                        <p className="dashboard-subtitle">
                            Upload or capture a photo of the ingredient label to get started
                        </p>
                    </div>

                    <div className="dashboard-actions">
                        <button
                            className="btn-primary upload-btn"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={analyzing}
                            id="upload-btn"
                        >
                            <Upload size={20} />
                            Upload Image
                        </button>
                        <button
                            className="btn-secondary camera-btn"
                            onClick={cameraActive ? stopCamera : startCamera}
                            disabled={analyzing}
                            id="camera-btn"
                        >
                            <Camera size={20} />
                            {cameraActive ? 'Stop Camera' : 'Take Picture'}
                        </button>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        id="file-input"
                    />

                    <div className="dashboard-form-row">
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Product name (optional — helps AI identify better)"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            disabled={analyzing}
                            id="product-name-input"
                        />
                    </div>

                    {cameraActive && (
                        <div className="camera-preview" id="camera-preview">
                            <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
                            <button
                                className="btn-primary capture-btn"
                                onClick={capturePhoto}
                                id="capture-btn"
                            >
                                <Camera size={20} />
                                Capture
                            </button>
                        </div>
                    )}

                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    <div
                        className={`image-drop-zone ${dragOver ? 'drag-over' : ''} ${imageDataUrl ? 'has-image' : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        id="drop-zone"
                    >
                        {imageDataUrl ? (
                            <div className="image-preview-wrapper">
                                <img src={imageDataUrl} alt="Product label" className="image-preview" />
                                {!analyzing && (
                                    <button
                                        className="image-remove-btn"
                                        onClick={removeImage}
                                        aria-label="Remove image"
                                        id="remove-image-btn"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="drop-zone-placeholder">
                                <Upload size={36} className="drop-zone-icon" />
                                <p className="drop-zone-text">Drag & drop an image here</p>
                                <p className="drop-zone-hint">or use the buttons above</p>
                            </div>
                        )}
                    </div>

                    <button
                        className={`btn-primary analyze-btn ${analyzing ? 'analyzing' : ''}`}
                        onClick={handleAnalyze}
                        disabled={analyzing || !image}
                        id="analyze-btn"
                    >
                        {analyzing ? (
                            <>
                                <Spinner size={22} />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Analyze Ingredients
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
