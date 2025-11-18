import { useState, useEffect, useRef } from "react";
import Header from './components/Header';
import ResearchStatus from './components/ResearchStatus';
import ResearchReport from './components/ResearchReport';
import ResearchForm from './components/ResearchForm';
import ResearchQueries from './components/ResearchQueries';
import { ResearchOutput, ResearchStatusType } from './types';
import { colorAnimation, dmSansStyle, glassStyle, fadeInAnimation } from './styles';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Add styles to document head
const colorStyle = document.createElement('style');
colorStyle.textContent = colorAnimation;
document.head.appendChild(colorStyle);

const dmSansStyleElement = document.createElement('style');
dmSansStyleElement.textContent = dmSansStyle;
document.head.appendChild(dmSansStyleElement);

function App() {

  const [isResearching, setIsResearching] = useState(false);
  const [status, setStatus] = useState<ResearchStatusType | null>(null);
  const [output, setOutput] = useState<ResearchOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [originalCompanyName, setOriginalCompanyName] = useState<string>("");
  const [currentPhase, setCurrentPhase] = useState<'search' | 'enrichment' | 'briefing' | 'complete' | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const [queries, setQueries] = useState<Array<{ text: string; number: number; category: string }>>([]);
  const [streamingQueries, setStreamingQueries] = useState<Record<string, { text: string; number: number; category: string; isComplete: boolean }>>({});
  const [isQueriesExpanded, setIsQueriesExpanded] = useState(true);

  // Add new state for color cycling
  const [loaderColor, setLoaderColor] = useState("#468BFF");
  
  // Add useEffect for color cycling
  useEffect(() => {
    if (!isResearching) return;
    
    const colors = [
      "#468BFF", // Blue
      "#8FBCFA", // Light Blue
      "#FE363B", // Red
      "#FF9A9D", // Light Red
      "#FDBB11", // Yellow
      "#F6D785", // Light Yellow
    ];
    
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % colors.length;
      setLoaderColor(colors[currentIndex]);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isResearching]);

  const resetResearch = () => {
    setIsResetting(true);
    
    // Use setTimeout to create a smooth transition
    setTimeout(() => {
      setStatus(null);
      setOutput(null);
      setError(null);
      setIsComplete(false);
      setCurrentPhase(null);
      setQueries([]);
      setStreamingQueries({});
      setIsResetting(false);
    }, 300);
  };

  // Stream research results via SSE
  const streamResults = (jobId: string) => {
    const eventSource = new EventSource(`${API_URL}/research/${jobId}/stream`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE Event]', data); // Debug: Log all SSE events
        
        if (data.type === 'progress' && data.step) {
          // Update status with current step
          const stepNames: Record<string, string> = {
            'grounding': 'Analyzing company information',
            'financial_analyst': 'Researching financial data',
            'news_scanner': 'Scanning latest news',
            'industry_analyst': 'Analyzing industry trends',
            'company_analyst': 'Researching company details',
            'collector': 'Collecting research data',
            'curator': 'Curating relevant information',
            'enricher': 'Enriching data with context',
            'briefing': 'Generating briefings',
            'editor': 'Finalizing report'
          };
          
          // Map step to phase for animations
          const phaseMap: Record<string, 'search' | 'enrichment' | 'briefing'> = {
            'grounding': 'search',
            'financial_analyst': 'search',
            'news_scanner': 'search',
            'industry_analyst': 'search',
            'company_analyst': 'search',
            'collector': 'search',
            'curator': 'search',
            'enricher': 'enrichment',
            'briefing': 'briefing',
            'editor': 'briefing'
          };
          
          setCurrentPhase(phaseMap[data.step] || 'search');
          setStatus({ 
            step: data.step, 
            message: stepNames[data.step] || `Processing ${data.step}...`
          });
        } else if (data.type === 'query_generating') {
          // Show query being generated and update streaming queries
          setCurrentPhase('search');
          setStatus({
            step: data.category || 'Generating queries',
            message: `Query ${data.query_number}: ${data.query}`
          });
          // Update streaming queries with current partial query
          const key = `${data.category}_${data.query_number}`;
          setStreamingQueries(prev => ({
            ...prev,
            [key]: {
              text: data.query,
              number: data.query_number,
              category: data.category,
              isComplete: false
            }
          }));
        } else if (data.type === 'query_generated') {
          // Show completed query and move to queries list
          setCurrentPhase('search');
          setStatus({
            step: data.category || 'Query generated',
            message: `Generated: ${data.query}`
          });
          // Add to completed queries
          setQueries(prev => [...prev, {
            text: data.query,
            number: data.query_number,
            category: data.category
          }]);
          // Remove from streaming queries
          const key = `${data.category}_${data.query_number}`;
          setStreamingQueries(prev => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
          });
        } else if (data.type === 'research_init') {
          // Show research initialization
          setCurrentPhase('search');
          setStatus({
            step: 'Initializing',
            message: data.message || `Initiating research for ${data.company}`
          });
        } else if (data.type === 'crawl_start') {
          // Show website crawl starting
          setCurrentPhase('search');
          setStatus({
            step: 'Website Crawl',
            message: data.message || 'Crawling company website'
          });
        } else if (data.type === 'curation') {
          // Show curation progress
          setCurrentPhase('search');
          setStatus({
            step: 'Curating data',
            message: data.message || `Curating ${data.category} documents`
          });
        } else if (data.type === 'enrichment') {
          // Show enrichment progress
          setCurrentPhase('enrichment');
          setStatus({
            step: 'Enriching data',
            message: data.message || 'Enriching documents with additional content'
          });
        } else if (data.type === 'briefing_start') {
          // Show briefing generation starting
          setCurrentPhase('briefing');
          setStatus({
            step: 'Generating briefings',
            message: `Creating ${data.category} briefing from ${data.total_docs} documents`
          });
        } else if (data.type === 'briefing_complete') {
          // Show briefing completion
          setCurrentPhase('briefing');
          setStatus({
            step: 'Briefing complete',
            message: `${data.category} briefing generated (${data.content_length} characters)`
          });
        } else if (data.type === 'report_compilation') {
          // Show report compilation
          setCurrentPhase('briefing');
          setStatus({
            step: 'Finalizing report',
            message: data.message || 'Compiling final report'
          });
        } else if (data.type === 'complete' && data.report) {
          setOutput({
            summary: "",
            details: { report: data.report },
          });
          setStatus({ step: "Complete", message: "Research completed successfully" });
          setIsComplete(true);
          setIsResearching(false);
          eventSource.close();
        } else if (data.type === 'error') {
          setError(data.error);
          setIsResearching(false);
          eventSource.close();
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    };

    eventSource.onerror = () => {
      setError('Connection lost or server error');
      setIsResearching(false);
      eventSource.close();
    };
  };

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  // Create a custom handler for the form that receives form data
  const handleFormSubmit = async (formData: {
    companyName: string;
    companyUrl: string;
    companyHq: string;
    companyIndustry: string;
  }) => {

    // Clear any existing errors first
    setError(null);

    // If research is complete, reset the UI first
    if (isComplete) {
      resetResearch();
      await new Promise(resolve => setTimeout(resolve, 300)); // Wait for reset animation
    }

    // Clear any existing SSE connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsResearching(true);
    setOriginalCompanyName(formData.companyName);
    setStatus({
      step: "Processing",
      message: "Starting research..."
    });

    try {
      const url = `${API_URL}/research`;

      // Format the company URL if provided
      const formattedCompanyUrl = formData.companyUrl
        ? formData.companyUrl.startsWith('http://') || formData.companyUrl.startsWith('https://')
          ? formData.companyUrl
          : `https://${formData.companyUrl}`
        : undefined;

      const requestData = {
        company: formData.companyName,
        company_url: formattedCompanyUrl,
        industry: formData.companyIndustry || undefined,
        hq_location: formData.companyHq || undefined,
      };

      const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.job_id) {
        console.log("Starting SSE stream for job_id:", data.job_id);
        streamResults(data.job_id);
      } else {
        throw new Error("No job ID received");
      }
    } catch (err) {
      console.log("Caught error:", err);
      setError(err instanceof Error ? err.message : "Failed to start research");
      setIsResearching(false);
    }
  };

  // Add new function to handle PDF generation
  const handleGeneratePdf = async () => {
    if (!output || isGeneratingPdf) return;
    
    setIsGeneratingPdf(true);
    try {
      console.log("Generating PDF with company name:", originalCompanyName);
      const response = await fetch(`${API_URL}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report_content: output.details.report,
          company_name: originalCompanyName || output.details.report
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `${originalCompanyName || 'research_report'}.pdf`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Add new function to handle copying to clipboard
  const handleCopyToClipboard = async () => {
    if (!output?.details?.report) return;
    
    try {
      await navigator.clipboard.writeText(output.details.report);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setError('Failed to copy to clipboard');
    }
  };


  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-gray-50 to-white p-8 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(70,139,255,0.35)_1px,transparent_0)] bg-[length:24px_24px] bg-center"></div>
      <div className="max-w-5xl mx-auto space-y-8 relative">
        {/* Header Component */}
        <Header glassStyle={glassStyle.card} />

        {/* Form Section */}
        <ResearchForm 
          onSubmit={handleFormSubmit}
          isResearching={isResearching}
          glassStyle={glassStyle}
          loaderColor={loaderColor}
        />

        {/* Error Message */}
        {error && (
          <div 
            className={`${glassStyle.card} border-[#FE363B]/30 bg-[#FE363B]/10 ${fadeInAnimation.fadeIn} ${isResetting ? 'opacity-0 transform -translate-y-4' : 'opacity-100 transform translate-y-0'} font-['DM_Sans']`}
          >
            <p className="text-[#FE363B]">{error}</p>
          </div>
        )}

        {/* Status Box */}
        <ResearchStatus
          status={status}
          error={error}
          isComplete={isComplete}
          currentPhase={currentPhase}
          isResetting={isResetting}
          glassStyle={glassStyle}
          loaderColor={loaderColor}
          statusRef={statusRef}
        />

        {/* Research Queries */}
        {(queries.length > 0 || Object.keys(streamingQueries).length > 0) && (
          <ResearchQueries
            queries={queries}
            streamingQueries={streamingQueries}
            isExpanded={isQueriesExpanded}
            onToggleExpand={() => setIsQueriesExpanded(!isQueriesExpanded)}
            isResetting={isResetting}
            glassStyle={glassStyle.card}
          />
        )}

        {/* Research Report */}
        {output && output.details && (
          <ResearchReport
            output={{
              summary: output.summary,
              details: {
                report: output.details.report || ''
              }
            }}
            isResetting={isResetting}
            glassStyle={glassStyle}
            fadeInAnimation={fadeInAnimation}
            loaderColor={loaderColor}
            isGeneratingPdf={isGeneratingPdf}
            isCopied={isCopied}
            onCopyToClipboard={handleCopyToClipboard}
            onGeneratePdf={handleGeneratePdf}
          />
        )}
      </div>
    </div>
  );
}

export default App;