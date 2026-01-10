/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
// components/ui/rich-text-editor.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  Link,
  Image,
  Undo,
  Redo,
  Loader2,
  ImageIcon,
  Type
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start typing...", 
  className = "" 
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  
  // State to track active formatting
  const [activeFormatting, setActiveFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    list: false,
    orderedList: false,
    quote: false,
    code: false,
    link: false,
    heading1: false,
    heading2: false,
    heading3: false,
    paragraph: false,
  });

  // Initialize editor with provided value
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Update active formatting state when selection changes
  const updateFormattingState = () => {
    const formatBlock = document.queryCommandValue('formatBlock');
    
    setActiveFormatting({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      list: document.queryCommandState('insertUnorderedList'),
      orderedList: document.queryCommandState('insertOrderedList'),
      quote: formatBlock === 'blockquote',
      code: formatBlock === 'pre',
      link: document.queryCommandState('createLink'),
      heading1: formatBlock === 'h1',
      heading2: formatBlock === 'h2',
      heading3: formatBlock === 'h3',
      paragraph: formatBlock === 'p' || formatBlock === '' || formatBlock === 'div',
    });
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      updateFormattingState();
    }
  };

  const handleSelectionChange = () => {
    updateFormattingState();
  };

  // Add event listeners for selection changes
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  // Helper function to execute commands and focus editor
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleInput();
    editorRef.current?.focus();
  };

  // Helper function to handle list commands
  const handleListCommand = (command: 'insertUnorderedList' | 'insertOrderedList') => {
    document.execCommand(command, false);
    editorRef.current?.focus();
    handleInput();
  };

  const handleLink = () => {
    if (linkUrl) {
      execCommand("createLink", linkUrl);
      setLinkUrl("");
      setIsLinkDialogOpen(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'blog-content'); // Specify folder for content images

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await response.json();
      
      // Insert the image at cursor position
      insertImage(data.url, data.alt || imageAlt || 'Blog image');
      
      toast.success('Image uploaded successfully');
      setIsImageDialogOpen(false);
      setImageUrl("");
      setImageAlt("");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const insertImage = (url: string, alt: string = 'Blog image') => {
    if (!editorRef.current) return;

    // Focus the editor
    editorRef.current.focus();

    // Get the selection
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    // Create image element
    const img = document.createElement('img');
    img.src = url;
    img.alt = alt;
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.display = 'block';
    img.style.margin = '1rem 0';
    img.style.borderRadius = '0.375rem';
    
    // Create a wrapper div for the image
    const wrapper = document.createElement('div');
    wrapper.contentEditable = 'false';
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    wrapper.style.maxWidth = '100%';
    wrapper.appendChild(img);

    // Insert the wrapper at cursor position
    range.deleteContents();
    range.insertNode(wrapper);

    // Move cursor after the image
    range.setStartAfter(wrapper);
    range.setEndAfter(wrapper);
    selection.removeAllRanges();
    selection.addRange(range);

    // Add a line break after the image
    const br = document.createElement('br');
    range.insertNode(br);

    // Update content
    handleInput();
  };

  const handleImageUrl = () => {
    if (imageUrl) {
      insertImage(imageUrl, imageAlt || 'Blog image');
      setImageUrl("");
      setImageAlt("");
      setIsImageDialogOpen(false);
    }
  };

  const handleImageButtonClick = () => {
    setIsImageDialogOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            execCommand('redo');
          } else {
            execCommand('undo');
          }
          break;
      }
    }
  };

  // Helper function to determine button variant based on active state
  const getButtonVariant = (isActive: boolean) => {
    return isActive ? "default" : "ghost";
  };

  return (
    <div className={`border rounded-md overflow-hidden ${className} rich-text-editor`}>
      <div className="toolbar border-b p-2 flex flex-wrap gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("undo")}
          title="Undo (Ctrl+Z)"
          className="toolbar-button"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("redo")}
          title="Redo (Ctrl+Shift+Z)"
          className="toolbar-button"
        >
          <Redo className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Text formatting buttons */}
        <Button
          type="button"
          variant={getButtonVariant(activeFormatting.paragraph)}
          size="sm"
          onClick={() => execCommand("formatBlock", "p")}
          title="Paragraph"
          className="toolbar-button"
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={getButtonVariant(activeFormatting.heading1)}
          size="sm"
          onClick={() => execCommand("formatBlock", "h1")}
          title="Heading 1"
          className="toolbar-button"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={getButtonVariant(activeFormatting.heading2)}
          size="sm"
          onClick={() => execCommand("formatBlock", "h2")}
          title="Heading 2"
          className="toolbar-button"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={getButtonVariant(activeFormatting.heading3)}
          size="sm"
          onClick={() => execCommand("formatBlock", "h3")}
          title="Heading 3"
          className="toolbar-button"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Style formatting buttons */}
        <Button
          type="button"
          variant={getButtonVariant(activeFormatting.bold)}
          size="sm"
          onClick={() => execCommand("bold")}
          title="Bold (Ctrl+B)"
          className="toolbar-button"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={getButtonVariant(activeFormatting.italic)}
          size="sm"
          onClick={() => execCommand("italic")}
          title="Italic (Ctrl+I)"
          className="toolbar-button"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={getButtonVariant(activeFormatting.underline)}
          size="sm"
          onClick={() => execCommand("underline")}
          title="Underline (Ctrl+U)"
          className="toolbar-button"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* List and structure buttons */}
        <Button
          type="button"
          variant={getButtonVariant(activeFormatting.list)}
          size="sm"
          onClick={() => handleListCommand("insertUnorderedList")}
          title="Bullet List"
          className="toolbar-button"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={getButtonVariant(activeFormatting.orderedList)}
          size="sm"
          onClick={() => handleListCommand("insertOrderedList")}
          title="Numbered List"
          className="toolbar-button"
        >
          <ListOrdered className="h-4 w-4" />
        </Button> 
        <Button
          type="button"
          variant={getButtonVariant(activeFormatting.quote)}
          size="sm"
          onClick={() => execCommand("formatBlock", "blockquote")}
          title="Quote"
          className="toolbar-button"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={getButtonVariant(activeFormatting.code)}
          size="sm"
          onClick={() => execCommand("formatBlock", "pre")}
          title="Code"
          className="toolbar-button"
        >
          <Code className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Media buttons */}
        <Button
          type="button"
          variant={getButtonVariant(activeFormatting.link)}
          size="sm"
          onClick={() => setIsLinkDialogOpen(true)}
          title="Link"
          className="toolbar-button"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleImageButtonClick}
          title="Insert Image"
          disabled={isUploading}
          className="toolbar-button"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Image className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {/* Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="link-url" className="text-sm font-medium">
                URL
              </label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsLinkDialogOpen(false);
                  setLinkUrl("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleLink}>
                Add Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="url">From URL</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload image</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Choose File"
                    )}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="url" className="space-y-4">
                <div>
                  <label htmlFor="image-url" className="text-sm font-medium">
                    Image URL
                  </label>
                  <Input
                    id="image-url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="image-alt" className="text-sm font-medium">
                    Alt Text
                  </label>
                  <Input
                    id="image-alt"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Image description"
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleImageUrl} disabled={!imageUrl}>
                  Insert Image
                </Button>
              </TabsContent>
            </Tabs>
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsImageDialogOpen(false);
                  setImageUrl("");
                  setImageAlt("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <div
        ref={editorRef}
        contentEditable
        className="editor-content min-h-75 p-4 focus:outline-none prose max-w-none"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onMouseUp={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />
      
      <style jsx global>{`
        .rich-text-editor {
          border-color: hsl(var(--border));
          background-color: hsl(var(--background));
        }
        
        .toolbar {
          background-color: hsl(var(--muted));
        }
        
        .toolbar-button {
          color: hsl(var(--muted-foreground));
        }
        
        .toolbar-button:hover {
          background-color: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
        }
        
        /* Enhanced active state for better visibility */
        .toolbar-button[data-state="on"] {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
        }
        
        .editor-content {
          color: hsl(var(--foreground));
          background-color: hsl(var(--background));
          min-height: 300px;
        }
        
        .editor-content:focus {
          outline: none;
        }
        
        .editor-content:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
        
        .editor-content h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
          color: hsl(var(--foreground));
        }
        
        .editor-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
          color: hsl(var(--foreground));
        }
        
        .editor-content h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
          color: hsl(var(--foreground));
        }
        
        .editor-content p {
          margin: 1rem 0;
          line-height: 1.5;
        }
        
        .editor-content blockquote {
          border-left: 4px solid hsl(var(--border));
          padding-left: 1rem;
          margin: 1rem 0;
          color: hsl(var(--muted-foreground));
        }
        
        .editor-content pre {
          background-color: hsl(var(--muted));
          padding: 1rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          font-family: monospace;
          color: hsl(var(--foreground));
        }
        
        .editor-content ul,
        .editor-content ol {
          padding-left: 2rem;
          margin: 1rem 0;
          color: hsl(var(--foreground));
          list-style-position: outside;
        }
        
        .editor-content ul {
          list-style-type: disc;
        }
        
        .editor-content ol {
          list-style-type: decimal;
        }
        
        .editor-content li {
          margin: 0.5rem 0;
          display: list-item;
        }
        
        .editor-content a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
        
        .editor-content img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 1rem 0;
          border-radius: 0.375rem;
        }
      `}</style>
    </div>
  );
}