import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, X, Send, UploadCloud } from 'lucide-react';
import { feedbackApi } from '../../api/feedback.api';
import { authApi } from '../../api/auth.api';
import axios from 'axios';
import { toast } from '../../hooks/use-toast';
import { cn } from '../../lib/utils';

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleImageChange = (file: File | null) => {
    if (!file) {
      setImage(null);
      setImagePreview(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (PNG, JPG, WEBP).',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image size should be less than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      let imageUrl: string | undefined = undefined;

      if (image) {
        // 1. Get Presigned Upload URL from the auth API
        const { uploadUrl, s3Key } = await authApi.getAvatarUploadUrl(image.name, image.type);

        // 2. Direct PUT request to S3
        await axios.put(uploadUrl, image, {
          headers: {
            'Content-Type': image.type,
          },
        });
        imageUrl = s3Key;
      }

      await feedbackApi.sendFeedback({
        text: text.trim(),
        imageUrl,
      });

      toast({
        title: 'Feedback Sent!',
        description: 'Thank you for helping us improve Quizzar.',
      });

      setText('');
      setImage(null);
      setImagePreview(null);
      setIsOpen(false);
    } catch (err) {
      console.error('Feedback submission error:', err);
      toast({
        title: 'Submission Failed',
        description: 'Could not send feedback. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-45 w-14 h-14 rounded-full primary-gradient text-white flex items-center justify-center shadow-lg shadow-[#0A99AB]/20 hover:shadow-[#0A99AB]/40 transition-shadow duration-300 outline-none cursor-pointer border-none"
        title="Send feedback"
      >
        <MessageSquarePlus className="w-6 h-6" />
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              ref={modalRef}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-[#0A99AB]/10 text-[#0A99AB] flex items-center justify-center">
                    <MessageSquarePlus className="w-4.5 h-4.5" />
                  </span>
                  <div>
                    <h3 className="font-black text-slate-950 text-base leading-none">Share Feedback</h3>
                    <p className="text-[10px] text-slate-400 font-bold tracking-wide mt-1.5">HELP US IMPROVE QUIZZAR</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                {/* Textarea */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="feedback-text" className="font-bold text-[10px] text-slate-400 uppercase tracking-widest px-1">
                    Your Observation / Message *
                  </label>
                  <textarea
                    id="feedback-text"
                    required
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Tell us what you observed, suggest a feature, or report a bug..."
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#0A99AB]/20 focus:border-[#0A99AB] transition-all outline-none text-sm text-slate-800 resize-none font-medium placeholder:text-slate-400"
                  />
                </div>

                {/* File/Image Upload Area */}
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-[10px] text-slate-400 uppercase tracking-widest px-1">
                    Screenshot / Image (Optional)
                  </span>

                  <AnimatePresence mode="wait">
                    {imagePreview ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 h-40 flex items-center justify-center"
                      >
                        <img
                          src={imagePreview}
                          alt="Screenshot preview"
                          className="max-h-full max-w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => handleImageChange(null)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white flex items-center justify-center transition-colors cursor-pointer border-none"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="uploader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          'border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 h-40 bg-slate-50/30 border-slate-200 hover:border-[#0A99AB]/40 hover:bg-[#0A99AB]/5 group',
                          dragActive && 'border-[#0A99AB] bg-[#0A99AB]/5 scale-[0.99]'
                        )}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                          accept="image/*"
                          className="hidden"
                        />
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#0A99AB]/10 group-hover:text-[#0A99AB] transition-all">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-700">
                          {dragActive ? 'Drop your image here' : 'Drag & drop image here, or click to browse'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">Supports PNG, JPG, WEBP up to 5MB</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-xs cursor-pointer bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!text.trim() || isSubmitting}
                    className="primary-gradient px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer border-none"
                  >
                    <span>{isSubmitting ? 'Sending...' : 'Send Feedback'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
