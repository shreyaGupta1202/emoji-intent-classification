"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label"; // Import Label
import { Reply, Conversation } from "@/types/conversation";
import { Plus, Trash2, MessageSquarePlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ConversationBuilderProps {
  initialConversation?: Conversation[];
  onConversationChange: (conversation: Conversation[]) => void;
}

const generateUniqueId = () => Math.random().toString(36).substring(2, 11);

interface AddMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (author: string, message: string) => void;
  title: string;
  description: string;
  initialAuthor?: string;
}

const AddMessageDialog: React.FC<AddMessageDialogProps> = ({
  isOpen,
  onClose,
  onAdd,
  title,
  description,
  initialAuthor = "",
}) => {
  const [author, setAuthor] = useState(initialAuthor);
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (author && message) {
      onAdd(author, message);
      setAuthor(initialAuthor); // Reset author to initial or empty
      setMessage("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="author" className="text-right">
              Author
            </Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="message" className="text-right">
              Message
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const MessageEditor = ({
  message,
  onUpdate,
  onDelete,
  onAddReply,
  depth = 0,
}: {
  message: Conversation | Reply;
  onUpdate: (updatedMessage: Conversation | Reply) => void;
  onDelete: (id: string) => void;
  onAddReply: (parentId: string, author: string) => void;
  depth?: number;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAuthor, setEditedAuthor] = useState(message.author);
  const [editedMessage, setEditedMessage] = useState(message.message);

  const handleSave = () => {
    onUpdate({ ...message, author: editedAuthor, message: editedMessage });
    setIsEditing(false);
  };

  const depthClass = depth > 0 ? "ml-6 border-l pl-4" : "";

  return (
    <Card className={`mb-2 ${depthClass}`}>
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editedAuthor}
              onChange={(e) => setEditedAuthor(e.target.value)}
              placeholder="Author"
            />
            <Textarea
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              placeholder="Message"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center">
              <p className="font-semibold text-primary">{message.author}</p>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddReply(message.id, message.author)}
                >
                  <MessageSquarePlus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(message.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <p className="text-foreground/80 mt-1">{message.message}</p>
          </div>
        )}

        {message.replies && message.replies.length > 0 && (
          <div className="mt-4">
            {message.replies.map((reply) => (
              <MessageEditor
                key={reply.id}
                message={reply}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onAddReply={onAddReply}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ConversationBuilder: React.FC<ConversationBuilderProps> = ({
  initialConversation = [],
  onConversationChange,
}) => {
  const [conversation, setConversation] =
    useState<Conversation[]>(initialConversation);
  const [isAddMessageModalOpen, setIsAddMessageModalOpen] = useState(false);
  const [isAddReplyModalOpen, setIsAddReplyModalOpen] = useState(false);
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyInitialAuthor, setReplyInitialAuthor] = useState<string>("");

  // Sync internal state with external prop changes
  useEffect(() => {
    setConversation(initialConversation);
  }, [initialConversation]);

  const addMessage = (author: string, message: string) => {
    const newMsg: Conversation = {
      id: generateUniqueId(),
      author: author,
      message: message,
      replies: [],
    };
    const updatedConversation = [...conversation, newMsg];
    setConversation(updatedConversation);
    onConversationChange(updatedConversation);
  };

  const updateMessage = (updatedMsg: Conversation | Reply) => {
    const updateRecursive = (
      messages: (Conversation | Reply)[]
    ): (Conversation | Reply)[] => {
      return messages.map((msg) => {
        if (msg.id === updatedMsg.id) {
          return updatedMsg;
        }
        if (msg.replies && msg.replies.length > 0) {
          return { ...msg, replies: updateRecursive(msg.replies) };
        }
        return msg;
      });
    };
    const updatedConversation = updateRecursive(conversation) as Conversation[];
    setConversation(updatedConversation);
    onConversationChange(updatedConversation);
  };

  const deleteMessage = (idToDelete: string) => {
    const deleteRecursive = (
      messages: (Conversation | Reply)[]
    ): (Conversation | Reply)[] => {
      return messages.filter((msg) => {
        if (msg.id === idToDelete) {
          return false;
        }
        if (msg.replies && msg.replies.length > 0) {
          msg.replies = deleteRecursive(msg.replies);
        }
        return true;
      });
    };
    const updatedConversation = deleteRecursive(conversation) as Conversation[];
    setConversation(updatedConversation);
    onConversationChange(updatedConversation);
  };

  const handleAddReplyClick = (parentId: string, author: string) => {
    setReplyParentId(parentId);
    setReplyInitialAuthor(`Replying to ${author}`);
    setIsAddReplyModalOpen(true);
  };

  const addReply = (author: string, message: string) => {
    if (!replyParentId) return;

    const newReply: Reply = {
      id: generateUniqueId(),
      author: author,
      message: message,
      replies: [],
    };

    const addReplyRecursive = (
      messages: (Conversation | Reply)[]
    ): (Conversation | Reply)[] => {
      return messages.map((msg) => {
        if (msg.id === replyParentId) {
          return { ...msg, replies: [...(msg.replies || []), newReply] };
        }
        if (msg.replies && msg.replies.length > 0) {
          return { ...msg, replies: addReplyRecursive(msg.replies) };
        }
        return msg;
      });
    };
    const updatedConversation = addReplyRecursive(
      conversation
    ) as Conversation[];
    setConversation(updatedConversation);
    onConversationChange(updatedConversation);
    setReplyParentId(null);
    setReplyInitialAuthor("");
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => setIsAddMessageModalOpen(true)} className="w-full">
        <Plus className="h-4 w-4 mr-2" /> Add New Message
      </Button>

      <AddMessageDialog
        isOpen={isAddMessageModalOpen}
        onClose={() => setIsAddMessageModalOpen(false)}
        onAdd={addMessage}
        title="Add New Conversation Message"
        description="Enter the author and content for the new top-level message."
      />

      <AddMessageDialog
        isOpen={isAddReplyModalOpen}
        onClose={() => setIsAddReplyModalOpen(false)}
        onAdd={addReply}
        title="Add Reply"
        description={`Replying to message from ${replyInitialAuthor}.`}
        initialAuthor={replyInitialAuthor}
      />

      <div className="mt-4 space-y-2">
        {conversation.map((msg) => (
          <MessageEditor
            key={msg.id}
            message={msg}
            onUpdate={updateMessage}
            onDelete={deleteMessage}
            onAddReply={handleAddReplyClick}
          />
        ))}
      </div>
    </div>
  );
};

export default ConversationBuilder;
