import { useState } from "react";
import axios from "axios";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronRight,
  CircleHelp,
  Cpu,
  Database,
  Gauge,
  LayoutDashboard,
  MessageSquareText,
  RotateCcw,
  Sparkles,
  Languages,
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
  { name: "Positive", value: 4634, color: "#4E8069" },
  { name: "Neutral", value: 5264, color: "#D5A458" },
  { name: "Negative", value: 4102, color: "#C8756D" },
];

const datasetData = [
  { name: "Training", value: 14000 },
  { name: "Validation", value: 3000 },
  { name: "Testing", value: 3000 },
];

const navigation = [
  { label: "Overview", icon: LayoutDashboard, id: "dashboard" },
  { label: "Sentiment analyser", icon: MessageSquareText, id: "analyser" },
  { label: "Translation", icon: Languages, id: "translator" },
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
            <p className="brand-name">
              bol<span>.</span>
            </p>
            <p className="brand-caption">HINGLISH NLP STUDIO</p>
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
          <ChevronRight className="workspace-chevron" size={16} />
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
          <span className="nav-section-label nav-section-spaced">Project</span>
          <div className="project-note">
            <span className="project-dot" />
            <span>Sentiment classification</span>
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <CircleHelp size={17} />
            </div>
            <div>
              <strong>Need a hand?</strong>
              <span>Explore your model setup</span>
            </div>
            <ArrowUpRight size={15} />
          </div>
          <div className="profile">
            <div className="avatar">HN</div>
            <div className="profile-copy">
              <strong>Hinglish NLP</strong>
              <span>Research workspace</span>
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
              {activeTab === "dashboard"
                ? "Overview"
                : activeTab === "analyser"
                  ? "Sentiment analyser"
                  : "Translation"}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="system-status">
              <i /> Model online
            </span>
            <span className="topbar-divider" />
            <div className="top-avatar">HN</div>
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
          value="20,000"
          detail="tweets & sentences"
          tone="sage"
        />
        <StatCard
          icon={<Gauge size={18} />}
          label="Test accuracy"
          value="69.77%"
          detail="XLM-RoBERTa V1 · held-out set"
          tone="gold"
        />
        <StatCard
          icon={<BarChart3 size={18} />}
          label="Macro F1"
          value="70.15%"
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
            subtitle="Sentiment labels · 14,000 training examples"
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
                <strong>14k</strong>
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
                    {((item.value / 14000) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
              <div className="legend-footnote">
                Labels are slightly weighted toward neutral.
              </div>
            </div>
          </div>
        </article>

        <article className="panel splits-panel">
          <PanelHeading
            title="Dataset split"
            subtitle="A 70 / 15 / 15 split across the full dataset"
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
                  tickFormatter={(value) => `${value / 1000}k`}
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
              20,000 records total
            </span>
            <span>
              Training set <b>70%</b>
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
          bol. <i>·</i> Hinglish NLP Studio
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
          bol. <i>·</i> Hinglish NLP Studio
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
      <span className="panel-indicator">
        <i />
      </span>
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
