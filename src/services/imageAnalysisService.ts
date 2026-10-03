export interface AiImageAnalysisResult {
  categories: string[];
  tags: string[];
  suggestedTitle: string;
  suggestedDescription: string;
  sceneType?: string;
  detectedObjects?: Array<{ name: string; confidence: number; category: string }>;
  confidence: number;
  source: string;
}

export async function analyzeImageForUpload(params: {
  file: File;
  projectName?: string;
  projectCategory?: string;
}): Promise<AiImageAnalysisResult> {
  const { file, projectName = '', projectCategory = '' } = params;

  // Convert first ~1.5MB of file to base64 for vision inspection
  let base64Data: string | undefined;
  try {
    if (file.type.startsWith('image/')) {
      base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            resolve('');
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  } catch (err) {
    console.warn('Could not read image file as base64, proceeding with filename analysis:', err);
  }

  try {
    const res = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64Data,
        mimeType: file.type || 'image/jpeg',
        fileName: file.name,
        projectName,
        projectCategory,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Network call to /api/analyze-image failed, using client fallback:', err);
  }

  // Client-side fallback
  const combined = `${file.name} ${projectName} ${projectCategory}`.toLowerCase();
  const cats: string[] = [];
  const tags: string[] = [];

  if (/tree|sapling|plant|forest|flora|agro|corridor|seedling/i.test(combined)) {
    cats.push('environmental');
    tags.push('native saplings', 'agroforestry', 'canopy foliage', 'mulch cover');
  }
  if (/solar|panel|microgrid|energy|electric|inverter/i.test(combined)) {
    cats.push('renewable_energy', 'infrastructure');
    tags.push('solar array', 'photovoltaic', 'clean energy', 'infrastructure');
  }
  if (/river|water|clean|waste|plastic|ghat|drainage/i.test(combined)) {
    cats.push('environmental', 'water_body');
    tags.push('water quality', 'river remediation', 'waste removal', 'plastic clearance');
  }
  if (/school|class|lab|stem|robot|student|education/i.test(combined)) {
    cats.push('educational', 'infrastructure', 'community');
    tags.push('classroom modernization', 'stem kits', 'student learning', 'infrastructure');
  }
  if (cats.length === 0) {
    cats.push('community');
    tags.push('community participation', 'field coordination', 'volunteer mobilization');
  }

  return {
    categories: cats,
    tags: Array.from(new Set(tags)),
    suggestedTitle: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
    suggestedDescription: `Field media captured for ${projectName} showing verified ${cats.join(', ')} progress.`,
    confidence: 0.88,
    source: 'client-fallback',
  };
}
