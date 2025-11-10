"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TextareaAutosize from "react-textarea-autosize";
import { motion } from "framer-motion";
import { Shield, ChevronsRight, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface ClassificationDetailProps {
  inputChat: any; // eslint-disable-line
  outputAnalysis: {
    conversation: { conversation: Conversation[] };
    keywords: Keywords[];
    severity: SeverityScores[];
  };
}

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
  outputAnalysis,
  depth = 0,
}: {
  msg: Conversation | Reply;
  keywordData?: Keywords;
  severityData?: SeverityScores;
  outputAnalysis: {
    conversation: { conversation: Conversation[] };
    keywords: Keywords[];
    severity: SeverityScores[];
  };
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
                            trace.impact > 0 ? "text-green-400" : "text-red-400"
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
                  <AlertTriangle size={16} className="mr-2 text-destructive" />
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
              keywordData={outputAnalysis.keywords?.find(
                (k) => k.id === reply.id
              )}
              severityData={outputAnalysis.severity?.find(
                (s) => s.id === reply.id
              )}
              outputAnalysis={outputAnalysis}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

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

export default function ClassificationDetail({
  inputChat,
  outputAnalysis,
}: ClassificationDetailProps) {
  const [isJsonView, setIsJsonView] = useState(false);
  const [isOutputJsonView, setIsOutputJsonView] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-primary">Input Conversation</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsJsonView(!isJsonView)}
          >
            {isJsonView
              ? "Toggle to Human Readable View"
              : "Toggle to JSON View"}
          </Button>
        </CardHeader>
        <CardContent>
          {isJsonView ? (
            <pre className="w-full bg-input border-border text-foreground font-mono text-sm p-2 rounded-md text-wrap">
              {JSON.stringify(inputChat, null, 2)}
            </pre>
          ) : (
            inputChat.conversation.map((thread: Conversation) => (
              <InputMessageNode key={thread.id} msg={thread} />
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-primary">Visualized Output</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOutputJsonView(!isOutputJsonView)}
          >
            {isOutputJsonView
              ? "Toggle to Human Readable View"
              : "Toggle to JSON View"}
          </Button>
        </CardHeader>
        <CardContent>
          {isOutputJsonView ? (
            <pre className="w-full bg-input border-border text-foreground font-mono text-sm p-2 rounded-md text-wrap">
              {JSON.stringify(outputAnalysis, null, 2)}
            </pre>
          ) : (
            outputAnalysis.conversation.conversation.map((thread) => (
              <MessageNode
                key={thread.id}
                msg={thread}
                keywordData={outputAnalysis.keywords?.find(
                  (k) => k.id === thread.id
                )}
                severityData={outputAnalysis.severity?.find(
                  (s) => s.id === thread.id
                )}
                outputAnalysis={outputAnalysis}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
