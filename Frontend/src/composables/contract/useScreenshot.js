import { ref } from 'vue';
import html2canvas from 'html2canvas';

export function useScreenshot() {
  const isCapturing = ref(false);

  const capture = async (element, options = {}) => {
    if (!element) {
      console.warn('No element provided for screenshot');
      return null;
    }

    isCapturing.value = true;

    try {
      const {
        shouldDownload = false,
        filename = `flow-capture-${Date.now()}.png`,
        quality = 1,
        backgroundColor = '#ffffff',
        scale = 2
      } = options;

      // Configuration pour html2canvas
      const canvas = await html2canvas(element, {
        backgroundColor,
        scale,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      // Convertir en blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png', quality);
      });

      if (shouldDownload) {
        // Télécharger automatiquement
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      return {
        blob,
        dataUrl: canvas.toDataURL('image/png', quality),
        canvas
      };

    } catch (error) {
      console.error('Error capturing screenshot:', error);
      throw error;
    } finally {
      isCapturing.value = false;
    }
  };

  const captureAndDownload = async (element, filename) => {
    return capture(element, { shouldDownload: true, filename });
  };

  const captureToClipboard = async (element) => {
    try {
      const result = await capture(element);
      if (result && navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': result.blob
          })
        ]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  };

  return {
    capture,
    captureAndDownload,
    captureToClipboard,
    isCapturing
  };
}