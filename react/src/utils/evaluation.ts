interface EvaluationData {
  q: string;
  a: string;
  t: number;
  i: string;
  m: string;
}

export async function submitEvaluation(type: 'good' | 'bad' | 'report', data: EvaluationData): Promise<boolean> {
  try {
    const response = await fetch(`http://10.133.0.61:9200/api/eval/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.status === 'success';
  } catch (error) {
    console.error(`Failed to submit ${type} evaluation:`, error);
    return false;
  }
}