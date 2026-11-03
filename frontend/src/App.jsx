import { useState } from "react";
import axios from "axios";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronRight,
  Cpu,
  Database,
  Gauge,
  LayoutDashboard,
  MessageSquareText,
  RotateCcw,
  Sparkles,
  Languages,
  Mic,
  MicOff,
  FileText,
  UploadCloud
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./App.css";

const sentimentData = [
  { name: "Positive", value: 166, color: "#4E8069" },
  { name: "Neutral", value: 166, color: "#D5A458" },
  { name: "Negative", value: 166, color: "#C8756D" },
];
const sentimentTotal = sentimentData.reduce((total, item) => total + item.value, 0);

const datasetData = [
  { name: "Training", value: 398 },
  { name: "Testing", value: 100 },
];

const navigation = [
  { label: "Overview", icon: LayoutDashboard, id: "dashboard" },
  { label: "Sentiment analyser", icon: MessageSquareText, id: "analyser" },
  { label: "Translation", icon: Languages, id: "translator" },
  { label: 'Voice Notes', icon: Mic, id: 'voice' },
  { label: 'Chat Analyzer', icon: FileText, id: 'chat' },
];


export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeSentiment = async () => {
    const text = inputText.trim();
    if (!text || loading) return;

    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post("http://127.0.0.1:8000/predict", {
        text,
      });
      setResult(response.data);
    } catch {
      setResult({
        error:
          "Could not reach the analysis service. Check that the local API is running, then try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setInputText("");
    setResult(null);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Activity size={19} strokeWidth={2.2} />
          </div>
          <div>
            <p className="brand-name">HinglishSense</p>
            <p className="brand-caption">
              An Intelligent NLP System for Hinglish Text Analysis
            </p>
          </div>
        </div>

        <div className="workspace-switcher">
          <div className="workspace-icon">
            <Cpu size={17} />
          </div>
          <div className="workspace-copy">
            <span className="eyebrow">WORKSPACE</span>
            <strong>XLM-R · Local</strong>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <span className="nav-section-label">Workspace</span>
          {navigation.map(({ label, icon: Icon, id }) => (
            <button
              className={`nav-link ${activeTab === id ? "is-active" : ""}`}
              key={id}
              onClick={() => setActiveTab(id)}
              aria-current={activeTab === id ? "page" : undefined}
            >
              <Icon size={17} strokeWidth={1.9} />
              <span>{label}</span>
              {id === "analyser" && <span className="nav-new">TRY</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile">
            <div className="avatar">A</div>
            <div className="profile-copy">
              <strong>HinglishSense</strong>
              <span>Minor Project</span>
            </div>
            <span className="profile-menu">···</span>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>
              {activeTab === "dashboard" ? "Overview" : 
              activeTab === "analyser" ? "Sentiment analyser" : 
              activeTab=== "translator" ? "Translation" : 
              activeTab === "voice" ? "Voice Notes" : 
              "Chat Analyzer"}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="system-status">
              <i /> Model online
            </span>
            <span className="topbar-divider" />
            <div className="top-avatar">A</div>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <Dashboard onOpenAnalyser={() => setActiveTab("analyser")} />
        )}
        {activeTab === "analyser" && (
          <Analyser
            inputText={inputText}
            setInputText={setInputText}
            result={result}
            loading={loading}
            onAnalyze={analyzeSentiment}
            onReset={resetAnalysis}
          />
        )}
        {activeTab === "translator" && <Translator />}
        {activeTab === 'voice' && <VoiceAnalyser />}
        {activeTab === 'chat' && <ChatBatchAnalyzer />}
      </main>
    </div>
  );
}

function Dashboard({ onOpenAnalyser }) {
  return (
    <div className="page-content dashboard-page">
      <section className="page-heading">
        <div>
          <p className="kicker">
            <span className="kicker-line" /> MODEL WORKSPACE{" "}
            <span className="kicker-date">· LAST UPDATED TODAY</span>
          </p>
          <h1>
            A clearer read on <em>Hinglish.</em>
          </h1>
          <p className="page-description">
            A snapshot of your sentiment model and the data behind it.
          </p>
        </div>
        <button
          className="primary-button heading-button"
          onClick={onOpenAnalyser}
        >
          <MessageSquareText size={16} /> Analyse a sentence{" "}
          <ArrowUpRight size={15} />
        </button>
      </section>

      <section className="stats-grid" aria-label="Model metrics">
        <StatCard
          icon={<Database size={18} />}
          label="Dataset size"
          value="498"
          detail="tweets & sentences"
          tone="sage"
        />
        <StatCard
          icon={<Gauge size={18} />}
          label="Test accuracy"
          value="89.00%"
          detail="XLM-RoBERTa V1 · held-out set"
          tone="gold"
        />
        <StatCard
          icon={<BarChart3 size={18} />}
          label="Macro F1"
          value="88.38%"
          detail="across 3 sentiment classes"
          tone="coral"
        />
        <StatCard
          icon={<Cpu size={18} />}
          label="Model parameters"
          value="278M"
          detail="xlm-roberta-base"
          tone="blue"
        />
      </section>

      <section className="chart-grid">
        <article className="panel distribution-panel">
          <PanelHeading
            title="What’s in the training data"
            subtitle="Sentiment labels · 398 training examples"
            meta="01 / DATA"
          />
          <div className="distribution-content">
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    innerRadius={66}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {sentimentData.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      Number(value).toLocaleString(),
                      "Examples",
                    ]}
                    contentStyle={{
                      background: "#fffefa",
                      border: "1px solid #e8e4da",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-label">
                <strong>398</strong>
                <span>examples</span>
              </div>
            </div>
            <div className="legend-list">
              {sentimentData.map((item) => (
                <div className="legend-row" key={item.name}>
                  <span className="legend-name">
                    <i style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <strong>{item.value.toLocaleString()}</strong>
                  <span className="legend-percent">
                    {((item.value / sentimentTotal) * 100).toFixed(2)}%
                  </span>
                </div>
              ))}
              <div className="legend-footnote">
                Balanced across all three sentiment classes.
              </div>
            </div>
          </div>
        </article>

        <article className="panel splits-panel">
          <PanelHeading
            title="Dataset split"
            subtitle="An 80 / 20 train-test split across the dataset"
            meta="02 / DATA"
          />
          <div className="split-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datasetData}
                margin={{ top: 10, right: 4, left: -20, bottom: 0 }}
                barSize={38}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="#eeece5"
                  strokeDasharray="3 5"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#77796f", fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#99998f", fontSize: 10 }}
                  tickFormatter={(value) => Number(value).toLocaleString()}
                />
                <Tooltip
                  formatter={(value) => [
                    Number(value).toLocaleString(),
                    "Records",
                  ]}
                  cursor={{ fill: "#f5f3ed" }}
                  contentStyle={{
                    background: "#fffefa",
                    border: "1px solid #e8e4da",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill="#4e8069" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="split-note">
            <span>
              <i />
              498 records total
            </span>
            <span>
              Training set <b>80%</b>
            </span>
            <span>
              Testing set <b>20%</b>
            </span>
          </div>
        </article>
      </section>

      <section className="bottom-grid">
        <article className="panel model-panel">
          <PanelHeading
            title="The model"
            subtitle="Currently active in this workspace"
            meta="03 / MODEL"
          />
          <div className="model-identity">
            <div className="model-emblem">
              <Cpu size={22} strokeWidth={1.7} />
            </div>
            <div>
              <h3>XLM-RoBERTa</h3>
              <p>Meta AI · multilingual representation</p>
            </div>
            <span className="active-pill">
              <i /> ACTIVE
            </span>
          </div>
          <div className="model-details">
            <div>
              <span>Architecture</span>
              <strong>RoBERTa Transformer</strong>
            </div>
            <div>
              <span>Classification</span>
              <strong>3 sentiment classes</strong>
            </div>
            <div>
              <span>Maximum tokens</span>
              <strong>128</strong>
            </div>
            <div>
              <span>Model version</span>
              <strong>V1 · Fine-tuned</strong>
            </div>
          </div>
        </article>
        <article className="quote-panel">
          <div className="quote-mark">“</div>
          <p>
            Language doesn’t always fit into one box. This model reads the
            feeling between the words.
          </p>
          <span>BUILT FOR CODE-SWITCHED CONVERSATION</span>
        </article>
      </section>
      <footer className="page-footer">
        <span>
          HinglishSense <i>·</i> Hinglish NLP Studio
        </span>
        <span>
          xlm-roberta-base <i>·</i> V1
        </span>
      </footer>
    </div>
  );
}

function Analyser({
  inputText,
  setInputText,
  result,
  loading,
  onAnalyze,
  onReset,
}) {
  const sentimentTone = result?.sentiment?.toLowerCase();
  const confidence = Number(result?.confidence_score);
  const examples = [
    "Yeh movie bahut acchi thi!",
    "Aaj ka din theek tha.",
    "Mujhe yeh bilkul pasand nahi aaya.",
  ];

  return (
    <div className="page-content analyser-page">
      <section className="page-heading analyser-heading">
        <div>
          <p className="kicker">
            <span className="kicker-line" /> SENTIMENT ANALYSER{" "}
            <span className="kicker-date">· XLM-R V1</span>
          </p>
          <h1>
            How does it <em>feel?</em>
          </h1>
          <p className="page-description">
            Write or paste a Hinglish sentence. Your model will read its overall
            sentiment.
          </p>
        </div>
        {result && !loading && (
          <button className="quiet-button" onClick={onReset}>
            <RotateCcw size={15} /> Start over
          </button>
        )}
      </section>

      <div className="analyser-layout">
        <section className="panel analyser-card">
          <div className="analyser-card-top">
            <div>
              <span className="step-label">
                01 <i /> YOUR TEXT
              </span>
              <h2>Start with a sentence</h2>
            </div>
            <span className="language-tag">HINGLISH · ENGLISH · HINDI</span>
          </div>
          <label className="sr-only" htmlFor="sentiment-text">
            Text to analyse
          </label>
          <textarea
            id="sentiment-text"
            className="sentiment-input"
            placeholder="Type something like “Yaar, aaj ka khana was actually so good”"
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            maxLength={1000}
          />
          <div className="input-meta">
            <span>Write naturally — code-switching is welcome.</span>
            <span>{inputText.length} / 1,000</span>
          </div>
          <button
            className="primary-button analyse-button"
            onClick={onAnalyze}
            disabled={loading || !inputText.trim()}
          >
            {loading ? (
              <>
                <span className="button-spinner" /> Reading your sentence…
              </>
            ) : (
              <>
                Analyse sentiment <ArrowUpRight size={16} />
              </>
            )}
          </button>

          {result && (
            <div
              className={`result-card ${result.error ? "result-error" : `result-${sentimentTone || "neutral"}`}`}
              aria-live="polite"
            >
              {result.error ? (
                <>
                  <div className="result-symbol error-symbol">!</div>
                  <div className="result-copy">
                    <span>ANALYSIS UNAVAILABLE</span>
                    <p>{result.error}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="result-symbol">
                    <Check size={18} />
                  </div>
                  <div className="result-copy">
                    <span>MODEL READ</span>
                    <h3>{result.sentiment || "Unclassified"}</h3>

                    <div
                      style={{
                        display: "flex",
                        gap: "20px",
                        marginTop: "12px",
                        borderTop: "1px solid #e8e4da",
                        paddingTop: "12px",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: "10px",
                            color: "#77796f",
                            fontWeight: "bold",
                            display: "block",
                            marginBottom: "4px",
                          }}
                        >
                          CONFIDENCE
                        </span>
                        <strong style={{ fontSize: "14px" }}>
                          {Number.isFinite(confidence)
                            ? `${(confidence * 100).toFixed(2)}%`
                            : "N/A"}
                        </strong>
                      </div>

                      <div>
                        <span
                          style={{
                            fontSize: "10px",
                            color: "#77796f",
                            fontWeight: "bold",
                            display: "block",
                            marginBottom: "4px",
                          }}
                        >
                          CONTENT FLAG
                        </span>
                        <strong
                          style={{
                            fontSize: "14px",
                            color: result.is_toxic ? "#C8756D" : "#4E8069",
                            backgroundColor: result.is_toxic
                              ? "#fdf2f2"
                              : "#f0fdf4",
                            padding: "2px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          {result.is_toxic ? "⚠️ Toxic / Slang" : "✓ Clean"}
                        </strong>
                      </div>
                    </div>
                  </div>
                  <div className="confidence-meter" aria-hidden="true">
                    <i
                      style={{
                        width: `${Number.isFinite(confidence) ? Math.min(Math.max(confidence * 100, 0), 100) : 0}%`,
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        <aside className="analyser-aside">
          <article className="aside-note">
            <div className="aside-icon">
              <Sparkles size={17} />
            </div>
            <span className="aside-eyebrow">A QUICK NOTE</span>
            <h3>Context matters.</h3>
            <p>
              This model was fine-tuned on Hinglish text. It looks at the whole
              sentence, not just individual words.
            </p>
          </article>
          <article className="examples-card">
            <span className="aside-eyebrow">TRY AN EXAMPLE</span>
            <p>Pick a line to get started:</p>
            {examples.map((example) => (
              <button
                className="example-button"
                key={example}
                onClick={() => setInputText(example)}
              >
                <span>“{example}”</span>
                <ArrowUpRight size={14} />
              </button>
            ))}
          </article>
          <p className="privacy-note">
            <Activity size={14} /> Text is sent to your local model for
            analysis.
          </p>
        </aside>
      </div>
      <footer className="page-footer">
        <span>
          HinglishSense <i>·</i> Hinglish NLP Studio
        </span>
        <span>
          xlm-roberta-base <i>·</i> V1
        </span>
      </footer>
    </div>
  );
}

function PanelHeading({ title, subtitle, meta }) {
  return (
    <div className="panel-heading">
      <div>
        <span className="panel-meta">{meta}</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, detail, tone }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon tone-${tone}`}>{icon}</div>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-detail">{detail}</span>
    </article>
  );
}

function Translator() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    const text = inputText.trim();
    if (!text || loading) return;

    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post("http://127.0.0.1:8000/translate", {
        text,
      });
      setResult(response.data);
    } catch {
      setResult({
        error: "Could not reach the translation service. Check the local API.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content analyser-page">
      <section className="page-heading analyser-heading">
        <div>
          <p className="kicker">
            <span className="kicker-line" /> HINGLISH TRANSLATOR{" "}
            <span className="kicker-date">· LOCAL API</span>
          </p>
          <h1>
            Understand the <em>context.</em>
          </h1>
          <p className="page-description">
            Translate code-mixed Hinglish sentences into standard English.
          </p>
        </div>
        {result && !loading && (
          <button
            className="quiet-button"
            onClick={() => {
              setInputText("");
              setResult(null);
            }}
          >
            <RotateCcw size={15} /> Start over
          </button>
        )}
      </section>

      <div className="analyser-layout">
        <section className="panel analyser-card">
          <div className="analyser-card-top">
            <div>
              <span className="step-label">
                01 <i /> ORIGINAL TEXT
              </span>
              <h2>Enter Hinglish sentence</h2>
            </div>
            <span className="language-tag">AUTO-DETECT</span>
          </div>
          <textarea
            className="sentiment-input"
            placeholder="Type something like “Bhai tera plan kya hai aaj raat ka?”"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            maxLength={1000}
          />
          <div className="input-meta">
            <span>Type exactly as you would on WhatsApp.</span>
            <span>{inputText.length} / 1,000</span>
          </div>
          <button
            className="primary-button analyse-button"
            onClick={handleTranslate}
            disabled={loading || !inputText.trim()}
          >
            {loading ? (
              <>
                <span className="button-spinner" /> Translating…
              </>
            ) : (
              <>
                Translate to English <ArrowUpRight size={16} />
              </>
            )}
          </button>

          {result && (
            <div
              className={`result-card ${result.error ? "result-error" : "result-positive"}`}
              aria-live="polite"
            >
              {result.error ? (
                <>
                  <div className="result-symbol error-symbol">!</div>
                  <div className="result-copy">
                    <span>TRANSLATION FAILED</span>
                    <p>{result.error}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="result-symbol">
                    <Languages size={18} />
                  </div>
                  <div className="result-copy">
                    <span>ENGLISH TRANSLATION</span>
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        marginTop: "4px",
                        lineHeight: "1.4",
                      }}
                    >
                      {result.translated_text}
                    </h3>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        <aside className="analyser-aside">
          <article className="aside-note">
            <div className="aside-icon">
              <Sparkles size={17} />
            </div>
            <span className="aside-eyebrow">HOW IT WORKS</span>
            <h3>Bridging the gap.</h3>
            <p>
              The translation engine automatically detects Romanized Hindi and
              translates the contextual meaning into standard English, making
              downstream processing much easier.
            </p>
          </article>
        </aside>
      </div>
    </div>
  );
}


function VoiceAnalyser() {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Ready to record');

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setTranscribedText('');
      setResult(null);
      setStatusMsg('Recording in progress...');
    } catch (err) {
      alert("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setStatusMsg('Audio captured. Ready to process.');
    }
  };

  const processAudio = async () => {
    if (!audioBlob) return;
    setLoading(true);
    setStatusMsg('Transcribing audio via Whisper...');
    setResult(null);

    try {
      // 1. Transcribe the audio
      const formData = new FormData();
      formData.append('file', audioBlob, 'voicenote.webm');
      
      const transcribeRes = await axios.post('http://127.0.0.1:8000/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (transcribeRes.data.error) throw new Error(transcribeRes.data.error);
      
      const text = transcribeRes.data.transcribed_text;
      setTranscribedText(text);
      setStatusMsg('Analyzing sentiment and toxicity...');

      // 2. Analyze the transcribed text
      const analyzeRes = await axios.post('http://127.0.0.1:8000/predict', { text });
      setResult(analyzeRes.data);
      setStatusMsg('Analysis complete.');
      
    } catch (err) {
      setStatusMsg('Error processing voice note. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setAudioBlob(null);
    setTranscribedText('');
    setResult(null);
    setStatusMsg('Ready to record');
  };

  const sentimentTone = result?.sentiment?.toLowerCase();
  const confidence = Number(result?.confidence_score);

  return (
    <div className="page-content analyser-page">
      <section className="page-heading analyser-heading">
        <div>
          <p className="kicker"><span className="kicker-line" /> VOICE ANALYSER <span className="kicker-date">· WHISPER AI</span></p>
          <h1>Speak <em>freely.</em></h1>
          <p className="page-description">Record a Hinglish voice note. The model will transcribe and analyze it instantly.</p>
        </div>
        {(audioBlob || result) && !loading && !isRecording && (
          <button className="quiet-button" onClick={resetAll}><RotateCcw size={15} /> Start over</button>
        )}
      </section>

      <div className="analyser-layout">
        <section className="panel analyser-card">
          <div className="analyser-card-top">
            <div>
              <span className="step-label">01 <i /> AUDIO CAPTURE</span>
              <h2>Record your message</h2>
            </div>
            <span className="language-tag">{statusMsg.toUpperCase()}</span>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', marginBottom: '20px' }}>
            {!isRecording ? (
              <button 
                className="primary-button" 
                onClick={startRecording} 
                style={{ backgroundColor: '#C8756D', color: '#fff' }}
                disabled={loading}
              >
                <Mic size={16} /> Start Recording
              </button>
            ) : (
              <button 
                className="primary-button" 
                onClick={stopRecording} 
                style={{ backgroundColor: '#1A1D2D', border: '1px solid #C8756D' }}
              >
                <MicOff size={16} /> Stop Recording
              </button>
            )}
            
            {audioBlob && !isRecording && (
              <button 
                className="primary-button analyse-button" 
                onClick={processAudio} 
                disabled={loading}
              >
                {loading ? <><span className="button-spinner" /> Processing...</> : <>Transcribe & Analyse <ArrowUpRight size={16} /></>}
              </button>
            )}
          </div>

          {transcribedText && (
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fcfbf9', border: '1px solid #e8e4da', borderRadius: '8px' }}>
              <span style={{ fontSize: '10px', color: '#77796f', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>TRANSCRIBED TEXT</span>
              <p style={{ margin: 0, fontSize: '14px', color: '#1A1D2D' }}>"{transcribedText}"</p>
            </div>
          )}

          {result && (
            <div className={`result-card result-${sentimentTone || 'neutral'}`} aria-live="polite">
              <div className="result-symbol"><Check size={18} /></div>
              <div className="result-copy">
                <span>MODEL READ</span>
                <h3>{result.sentiment || 'Unclassified'}</h3>
                
                <div style={{ display: 'flex', gap: '20px', marginTop: '12px', borderTop: '1px solid #e8e4da', paddingTop: '12px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#77796f', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>CONFIDENCE</span>
                    <strong style={{ fontSize: '14px' }}>{Number.isFinite(confidence) ? `${(confidence * 100).toFixed(2)}%` : 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#77796f', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>CONTENT FLAG</span>
                    <strong style={{ 
                      fontSize: '14px', 
                      color: result.is_toxic ? '#C8756D' : '#4E8069',
                      backgroundColor: result.is_toxic ? '#fdf2f2' : '#f0fdf4',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {result.is_toxic ? '⚠️ Toxic / Slang' : '✓ Clean'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="analyser-aside">
          <article className="aside-note">
            <div className="aside-icon"><Mic size={17} /></div>
            <span className="aside-eyebrow">SPEECH TO TEXT</span>
            <h3>Powered by Whisper.</h3>
            <p>This tab uses OpenAI's Whisper model running locally to accurately capture Indian accents and Hinglish vocabulary before passing the text to your sentiment rules.</p>
          </article>
        </aside>
      </div>
    </div>
  );
}


function ChatBatchAnalyzer() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile || !uploadedFile.name.endsWith('.txt')) {
      alert("Please upload a valid WhatsApp .txt export file.");
      return;
    }
    
    setFile(uploadedFile);
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await axios.post('http://127.0.0.1:8000/analyze-chat', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (err) {
      alert("Error analyzing chat file. Make sure the backend is running.");
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="page-content analyser-page">
      <section className="page-heading analyser-heading">
        <div>
          <p className="kicker"><span className="kicker-line" /> BATCH PROCESSING <span className="kicker-date">· LOCAL API</span></p>
          <h1>Read the <em>room.</em></h1>
          <p className="page-description">Upload a WhatsApp .txt export. The model will parse and map the overall sentiment.</p>
        </div>
        {result && !loading && (
          <button className="quiet-button" onClick={resetAll}><RotateCcw size={15} /> Start over</button>
        )}
      </section>

      <div className="analyser-layout">
        <section className="panel analyser-card">
          <div className="analyser-card-top">
            <div>
              <span className="step-label">01 <i /> CHAT EXPORT</span>
              <h2>Upload WhatsApp File</h2>
            </div>
            <span className="language-tag">.TXT ONLY</span>
          </div>
          
          {!result && !loading && (
            <div style={{ border: '2px dashed #e8e4da', borderRadius: '8px', padding: '40px 20px', textAlign: 'center', marginTop: '20px', backgroundColor: '#fcfbf9' }}>
              <UploadCloud size={32} color="#77796f" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '15px', marginBottom: '8px' }}>Drag and drop your chat file</h3>
              <p style={{ fontSize: '13px', color: '#77796f', marginBottom: '16px' }}>Export chat from WhatsApp (without media) and upload here.</p>
              <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#1A1D2D', color: '#fff', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                <FileText size={16} /> Select .txt File
                <input type="file" accept=".txt" style={{ display: 'none' }} onChange={handleFileUpload} />
              </label>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 20px', marginTop: '20px' }}>
              <span className="button-spinner" style={{ borderColor: '#1A1D2D', borderTopColor: 'transparent', width: '24px', height: '24px', margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: '14px', fontWeight: 'bold' }}>Translating and Summarizing chat log...</p>
            </div>
          )}

          {result && (
            <div style={{ marginTop: '20px' }}>
              
              {/* TOP STATS */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <div style={{ flex: 1, backgroundColor: '#fcfbf9', border: '1px solid #e8e4da', padding: '16px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '10px', color: '#77796f', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>MESSAGES FOUND</span>
                  <strong style={{ fontSize: '18px' }}>{result.total_found.toLocaleString()}</strong>
                </div>
                <div style={{ flex: 1, backgroundColor: '#fcfbf9', border: '1px solid #e8e4da', padding: '16px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '10px', color: '#77796f', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>SAMPLED FOR ANALYSIS</span>
                  <strong style={{ fontSize: '18px' }}>{result.analyzed}</strong>
                </div>
              </div>

              {/* GRAPH & LEGEND SIDE BY SIDE */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', backgroundColor: '#fffefa', padding: '16px', borderRadius: '8px', border: '1px solid #e8e4da' }}>
                <div style={{ height: '180px', width: '180px', flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={result.distribution} innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                        {result.distribution.map((item) => <Cell key={item.name} fill={item.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#fffefa', border: '1px solid #e8e4da', borderRadius: 10, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="legend-list" style={{ flex: 1 }}>
                  {result.distribution.map((item) => (
                    <div className="legend-row" key={item.name}>
                      <span className="legend-name"><i style={{ backgroundColor: item.color }} />{item.name}</span>
                      <strong>{item.value}</strong>
                      <span className="legend-percent">{((item.value / result.analyzed) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* MESSAGE LOG (ORIGINAL & TRANSLATED) */}
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '13px', color: '#77796f', borderBottom: '1px solid #e8e4da', paddingBottom: '8px', marginBottom: '16px' }}>MESSAGE LOG</h3>
                <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px' }}>
                  {result.chat_details.map((msg, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '16px', backgroundColor: '#fcfbf9', padding: '12px', borderRadius: '8px', border: '1px solid #e8e4da' }}>
                      
                      {/* 1. Original text with native browser tooltip for slang */}
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '10px', color: '#77796f', fontWeight: 'bold' }}>ORIGINAL HINGLISH</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 0 0' }}>
                          <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>{msg.original}</p>
                          
                          {msg.has_slang && (
                            <span 
                              title="Slang detected in this message"
                              style={{ 
                                backgroundColor: '#C8756D', color: '#fff', borderRadius: '50%', 
                                width: '14px', height: '14px', display: 'inline-flex', 
                                alignItems: 'center', justifyContent: 'center', fontSize: '10px', 
                                fontWeight: 'bold', cursor: 'help', flexShrink: 0
                              }}
                            >
                              !
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* 2. English translation */}
                      <div style={{ flex: 1, borderLeft: '1px solid #e8e4da', paddingLeft: '16px' }}>
                        <span style={{ fontSize: '10px', color: '#77796f', fontWeight: 'bold' }}>ENGLISH TRANSLATION</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', lineHeight: '1.5' }}>{msg.translated}</p>
                      </div>
                      
                      {/* 3. Standard sentiment badge */}
                      <div style={{ width: '60px', textAlign: 'right' }}>
                        <span style={{ 
                          fontSize: '9px', fontWeight: 'bold',
                          color: msg.sentiment === 'Negative' ? '#C8756D' : msg.sentiment === 'Positive' ? '#4E8069' : '#D5A458',
                          backgroundColor: msg.sentiment === 'Negative' ? '#fdf2f2' : msg.sentiment === 'Positive' ? '#f0fdf4' : '#fdf8f0',
                          padding: '2px 6px', borderRadius: '4px'
                        }}>
                          {msg.sentiment.toUpperCase()}
                        </span>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </section>

        <aside className="analyser-aside">
          <article className="aside-note">
            <div className="aside-icon"><FileText size={17} /></div>
            <span className="aside-eyebrow">BATCH PROCESSING</span>
            <h3>Analyze the collective.</h3>
            <p>Export any WhatsApp group chat (Settings {'>'} More {'>'} Export Chat) and upload the `.txt` file here. The system maps the mood and lists the translations.</p>
          </article>
          
          {/* DYNAMIC AI SUMMARY BOX */}
          {result && result.summary && (
            <article className="aside-note" style={{ marginTop: '16px', backgroundColor: '#f0fdf4', borderColor: '#4E8069' }}>
              <div className="aside-icon" style={{ backgroundColor: '#4E8069', color: '#fff' }}><Sparkles size={17} /></div>
              <span className="aside-eyebrow" style={{ color: '#4E8069' }}>AI SUMMARY</span>
              <h3 style={{ color: '#1A1D2D' }}>Conversation gist</h3>
              <p style={{ color: '#1A1D2D', lineHeight: '1.5', fontSize: '14px' }}>{result.summary}</p>
            </article>
          )}
        </aside>
      </div>
    </div>
  );
}