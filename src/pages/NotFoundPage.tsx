import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, SearchX } from 'lucide-react';
import { BrandButton } from '../components/common/BrandButton';
import { staggerContainer, fadeUp } from '../lib/motion';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] via-white to-[#00bcd4]/5 flex items-center justify-center px-4">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="text-center max-w-md"
      >
        {/* Animated 404 number */}
        <motion.div
          variants={fadeUp}
          className="relative mb-8"
        >
          <p className="text-[10rem] font-black leading-none bg-gradient-brand bg-clip-text text-transparent select-none">
            404
          </p>
          {/* Floating icon overlay */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-white shadow-brand-lg flex items-center justify-center">
              <SearchX className="w-10 h-10 text-[#00bcd4]" />
            </div>
          </motion.div>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="text-3xl font-black text-slate-900 mb-3"
        >
          Page not found
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-muted-foreground mb-8 leading-relaxed"
        >
          The page you're looking for doesn't exist or has been moved.
          It may also be a quiz link that has been deleted.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <BrandButton
            variant="secondary"
            onClick={() => navigate(-1)}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Go Back
          </BrandButton>
          <BrandButton
            onClick={() => navigate('/')}
            icon={<Home className="w-4 h-4" />}
          >
            Go Home
          </BrandButton>
        </motion.div>
      </motion.div>
    </div>
  );
}
