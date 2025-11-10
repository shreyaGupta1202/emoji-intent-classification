"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Shield, ChevronsRight, AlertTriangle, Info } from "lucide-react";
import { classifyConversation } from "./actions";
import Navbar from "@/components/landing/Navbar";
import ConversationBuilder from "@/components/ConversationBuilder"; // Import ConversationBuilder
import { useEffect } from "react"; // Import useEffect

import { Reply, Conversation } from "@/types/conversation";

interface Keywords {
  id: string;
  author: string;
  keywords: string[];
}

interface SeverityScores {
  id: string;
  author: string;
  scores: {
    emotions: { [key: string]: number };
    moderation: { [key: string]: number };
    overall_risk: number;
  };
  explainability: {
    top_matched_keywords: string[];
    top_modifiers: string[];
    rule_traces: { rule: string; impact: number }[];
  };
  escalate: boolean;
  escalation_reasons: string[];
  action_recommendation: string;
}

const initialJsonInput = `{
  "conversation": [
    {
      "id": "1",
      "author": "Sarah",
      "message": "Just released my new open-source project! 🎉 It's a tool for visualizing complex data. Would love to get some feedback.",
      "replies": [
        {
          "id": "2",
          "author": "Mark",
          "message": "This is awesome! I've been looking for something like this. The UI is so clean. Great job! 👏",
          "replies": []
        }
      ]
    },
    {
      "id": "3",
      "author": "Jane",
      "message": "This is a total piece of garbage. It doesn't even work. Don't waste your time. 😠",
      "replies": [
        {
          "id": "4",
          "author": "Peter",
          "message": "Hey, that's not very constructive. The author is just trying to share their work.",
          "replies": []
        },
        {
          "id": "5",
          "author": "Admin",
          "message": "Jane, please keep the conversation civil. This is a warning.",
          "replies": []
        }
      ]
    }
  ]
}`;

const emptyJsonInput = JSON.stringify({ conversation: [] }, null, 2);

const testConversationData = JSON.parse(initialJsonInput).conversation;

// InputMessageNode component (similar to the one in ClassificationDetail.tsx)
const InputMessageNode = ({
  msg,
  depth = 0,
}: {
  msg: Conversation | Reply;
  depth?: number;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const depthColors = [
    "bg-muted/50",
    "bg-muted/40",
    "bg-muted/30",
    "bg-muted/20",
    "bg-muted/10",
    "bg-muted/5",
    "bg-muted/0",
  ];
  const bgColor = depthColors[Math.min(depth, depthColors.length - 1)];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`ml-4 pl-4 border-l border-border mt-2`}
    >
      <div className={`${bgColor} p-4 rounded-lg`}>
        <div className="flex justify-between items-center">
          <p className="font-semibold text-primary">{msg.author}</p>
          {msg.replies && msg.replies.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? "+" : "-"}
            </Button>
          )}
        </div>
        <p className="text-foreground/80 mt-1">{msg.message}</p>
      </div>
      {!isCollapsed && msg.replies && msg.replies.length > 0 && (
        <div className="mt-2">
          {msg.replies.map((reply) => (
            <InputMessageNode key={reply.id} msg={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default function ClassifyPage() {
  const [jsonInput, setJsonInput] = useState<string>(emptyJsonInput);
  const [interactiveConversation, setInteractiveConversation] = useState<
    Conversation[]
  >([]); // New state for interactive builder
  const [conversation, setConversation] = useState<Conversation[] | null>(null);
  const [keywords, setKeywords] = useState<Keywords[] | null>(null);
  const [severity, setSeverity] = useState<SeverityScores[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInputJsonView, setIsInputJsonView] = useState(true); // Renamed from isJsonView for clarity
  const [isOutputJsonView, setIsOutputJsonView] = useState(false); // New state for output view
  const [isValidInput, setIsValidInput] = useState(false); // New state for input validity

  // Helper to validate conversation input
  const validateConversation = (input: string | Conversation[]) => {
    if (typeof input === "string") {
      try {
        const parsed = JSON.parse(input);
        return (
          parsed &&
          Array.isArray(parsed.conversation) &&
          parsed.conversation.length > 0
        );
      } catch (e) {
        return false;
      }
    } else {
      return Array.isArray(input) && input.length > 0;
    }
  };

  // Initialize interactiveConversation from initialJsonInput
  useEffect(() => {
    try {
      const parsed = JSON.parse(emptyJsonInput);
      if (parsed && parsed.conversation) {
        setInteractiveConversation(parsed.conversation);
      }
    } catch (e) {
      console.error(
        "Failed to parse initial JSON input for interactive builder:",
        e
      );
    }
  }, []);

  // Update jsonInput whenever interactiveConversation changes
  useEffect(() => {
    const newJson = JSON.stringify(
      { conversation: interactiveConversation },
      null,
      2
    );
    setJsonInput(newJson);
    setIsValidInput(validateConversation(interactiveConversation));
  }, [interactiveConversation]);

  // Validate jsonInput whenever it changes
  useEffect(() => {
    if (isInputJsonView) {
      setIsValidInput(validateConversation(jsonInput));
    }
  }, [jsonInput, isInputJsonView]);

  const handleLoadTestConversation = () => {
    setJsonInput(initialJsonInput);
    setInteractiveConversation(testConversationData);
  };

  const handleProcess = async () => {
    if (!isValidInput) {
      setError(
        "Please provide a valid conversation in the correct format. Current conversation is either empty or malformed."
      );
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      let dataToProcess;
      if (isInputJsonView) {
        dataToProcess = JSON.parse(jsonInput);
      } else {
        dataToProcess = { conversation: interactiveConversation };
      }
      const result = (await classifyConversation(dataToProcess)) as {
        conversation: { conversation: Conversation[] };
        keywords: Keywords[];
        severity: SeverityScores[];
      };
      setConversation(result.conversation.conversation);
      setKeywords(result.keywords);
      setSeverity(result.severity);
    } catch (e) {
      console.error(e);
      setError("Invalid JSON format or error during processing.");
      setConversation(null);
      setKeywords(null);
      setSeverity(null);
    } finally {
      setIsLoading(false);
    }
  };

  const ScoreBar = ({
    label,
    value,
    colorClass,
  }: {
    label: string;
    value: number;
    colorClass: string;
  }) => (
    <div className="flex items-center space-x-2">
      <span className="text-xs w-24 truncate">{label}</span>
      <div className="w-full bg-input rounded-full h-2.5">
        <div
          className={`${colorClass} h-2.5 rounded-full`}
          style={{ width: `${value}%` }}
          title={`${label}: ${value}%`}
        ></div>
      </div>
      <span className="text-xs w-8 text-right">{value}%</span>
    </div>
  );

  const ScoresDropdown = ({
    title,
    scores,
    colorMap,
  }: {
    title: string;
    scores: { [key: string]: number };
    colorMap: { [key: string]: string };
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dominantScore = Object.entries(scores).reduce(
      (a, b) => (a[1] > b[1] ? a : b),
      ["", 0]
    );

    return (
      <div className="mt-2">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="mr-1"
          >
            <ChevronsRight size={16} />
          </motion.div>
          <span className="text-sm font-semibold text-muted-foreground">
            {title}:
          </span>
          <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full ml-2">
            {dominantScore[0]}: {dominantScore[1]}%
          </span>
        </div>
        <motion.div
          initial={false}
          animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden pl-6"
        >
          <div className="flex flex-col space-y-1 mt-1 pt-2">
            {Object.entries(scores).map(([key, value]) => (
              <ScoreBar
                key={key}
                label={key}
                value={value}
                colorClass={colorMap[key] || "bg-[var(--chart-3)]"}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  };

  const MessageNode = ({
    msg,
    keywordData,
    severityData,
    depth = 0,
  }: {
    msg: Conversation | Reply;
    keywordData?: Keywords;
    severityData?: SeverityScores;
    depth?: number;
  }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const depthColors = [
      "bg-muted/50",
      "bg-muted/40",
      "bg-muted/30",
      "bg-muted/20",
      "bg-muted/10",
      "bg-muted/5",
      "bg-muted/0",
    ];
    const bgColor = depthColors[Math.min(depth, depthColors.length - 1)];

    const emotionColorMap: { [key: string]: string } = {
      joy: "bg-green-500",
      gratitude: "bg-yellow-500",
      admiration: "bg-purple-500",
      sadness: "bg-blue-500",
      anger: "bg-red-500",
      frustration: "bg-orange-500",
      contempt: "bg-pink-500",
    };

    const moderationColorMap: { [key: string]: string } = {
      toxicity: "bg-red-500",
      insult: "bg-orange-500",
      harassment: "bg-yellow-500",
      profanity: "bg-purple-500",
      obscene_gesture: "bg-pink-500",
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`ml-4 pl-4 border-l border-border mt-2`}
      >
        <div className={`${bgColor} p-4 rounded-lg`}>
          <div className="flex justify-between items-center">
            <p className="font-semibold text-primary">{msg.author}</p>
            {msg.replies && msg.replies.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? "+" : "-"}
              </Button>
            )}
          </div>
          <p className="text-foreground/80 mt-1">{msg.message}</p>

          {severityData && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                <div className="flex items-center">
                  <Shield size={16} className="mr-2 text-blue-400" />
                  <span className="text-sm font-semibold">Overall Risk</span>
                </div>
                <span
                  className={`font-bold text-lg ${
                    severityData.scores.overall_risk > 50
                      ? "text-destructive"
                      : "text-green-400"
                  }`}
                >
                  {severityData.scores.overall_risk}%
                </span>
              </div>

              <ScoresDropdown
                title="Emotions"
                scores={severityData.scores.emotions}
                colorMap={emotionColorMap}
              />
              <ScoresDropdown
                title="Moderation"
                scores={severityData.scores.moderation}
                colorMap={moderationColorMap}
              />

              <div className="mt-2">
                <div className="flex items-center">
                  <Info size={16} className="mr-2 text-gray-400" />
                  <span className="text-sm font-semibold text-muted-foreground">
                    Explainability
                  </span>
                </div>
                <div className="pl-6 text-xs space-y-2 mt-1">
                  <div>
                    <p className="font-semibold">Keywords:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {severityData.explainability.top_matched_keywords.map(
                        (kw) => (
                          <span
                            key={kw}
                            className="bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs"
                          >
                            {kw}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">Modifiers:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {severityData.explainability.top_modifiers.map((mod) => (
                        <span
                          key={mod}
                          className="bg-purple-900/50 text-purple-300 px-2 py-1 rounded-full text-xs"
                        >
                          {mod}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">Rule Traces:</p>
                    <div className="flex flex-col space-y-1 mt-1">
                      {severityData.explainability.rule_traces.map((trace) => (
                        <div
                          key={trace.rule}
                          className="flex justify-between text-gray-400"
                        >
                          <span>{trace.rule}</span>
                          <span
                            className={
                              trace.impact > 0
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {trace.impact > 0 ? "+" : ""}
                            {trace.impact}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {severityData.escalate && (
                <div className="mt-2 p-2 rounded-md bg-destructive/20 border border-destructive">
                  <div className="flex items-center">
                    <AlertTriangle
                      size={16}
                      className="mr-2 text-destructive"
                    />
                    <span className="text-sm font-semibold text-destructive">
                      Escalation Required
                    </span>
                  </div>
                  <div className="pl-6 text-xs space-y-1 mt-1">
                    <p className="font-semibold">Reasons:</p>
                    <ul className="list-disc list-inside">
                      {severityData.escalation_reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                    <p className="mt-2">
                      <span className="font-semibold">Recommendation:</span>{" "}
                      {severityData.action_recommendation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {!isCollapsed && msg.replies && msg.replies.length > 0 && (
          <div className="mt-2">
            {msg.replies.map((reply) => (
              <MessageNode
                key={reply.id}
                msg={reply}
                keywordData={keywords?.find((k) => k.id === reply.id)}
                severityData={severity?.find((s) => s.id === reply.id)}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="bg-background min-h-screen text-foreground p-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tight text-gradient-cyan-purple">
            Agentic AI Intent Classifier
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Analyze threaded conversations to detect intent, emotion, and
            harmful content.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-primary">
                1. Input Conversation
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsInputJsonView(!isInputJsonView)}
              >
                {isInputJsonView
                  ? "Toggle to Human Readable View"
                  : "Toggle to JSON View"}
              </Button>
            </CardHeader>
            <CardContent>
              {isInputJsonView ? (
                <TextareaAutosize
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full bg-input border-border text-foreground font-mono text-sm p-2 rounded-md text-wrap resize-none"
                  placeholder="Paste your conversation JSON here..."
                />
              ) : (
                <ConversationBuilder
                  initialConversation={interactiveConversation}
                  onConversationChange={setInteractiveConversation}
                />
              )}
              <Button
                onClick={handleProcess}
                className="mt-4 w-full"
                disabled={isLoading || !isValidInput}
              >
                {isLoading ? "Processing..." : "Process Conversation"}
              </Button>
              <Button
                onClick={handleLoadTestConversation}
                className="mt-2 w-full"
                variant="outline"
              >
                Load Test Conversation/Thread
              </Button>{" "}
              {error && <p className="text-destructive mt-2">{error}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-primary">
                2. Visualized Output
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOutputJsonView(!isOutputJsonView)}
                disabled={!conversation} // Disable if no conversation is processed yet
              >
                {isOutputJsonView
                  ? "Toggle to Human Readable View"
                  : "Toggle to JSON View"}
              </Button>
            </CardHeader>
            <CardContent>
              {conversation ? (
                isOutputJsonView ? (
                  <TextareaAutosize
                    value={JSON.stringify(
                      { conversation, keywords, severity },
                      null,
                      2
                    )}
                    readOnly
                    className="w-full bg-input border-border text-foreground font-mono text-sm p-2 rounded-md text-wrap resize-none"
                    minRows={10}
                  />
                ) : (
                  <div>
                    {conversation.map((thread) => (
                      <MessageNode
                        key={thread.id}
                        msg={thread}
                        keywordData={keywords?.find((k) => k.id === thread.id)}
                        severityData={severity?.find((s) => s.id === thread.id)}
                      />
                    ))}
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    Results will be displayed here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
