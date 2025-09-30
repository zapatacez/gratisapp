interface EventData {
  title: string;
  eventDate: string; // ISO format
  location: string;
  description: string;
  organizer: string;
}

interface ParseResult {
  event: EventData | null;
  success: boolean;
  error?: string;
}

export async function parseEventFromText(text: string, districtName: string): Promise<ParseResult> {
  try {
    const prompt = `You are an assistant that extracts event information from text extracted from event flyers in Spanish.

Extract the following information from the text below and return it as valid JSON:
- title: The event title/name
- eventDate: The event date and time in ISO 8601 format (YYYY-MM-DDTHH:mm:ss). If year is not specified, assume 2025. If time is not specified, use 19:00:00.
- location: The venue/location name and address
- description: A brief description of the event (extract from the text or summarize)
- organizer: Who is organizing the event (usually starts with "Municipalidad de..." or similar)

District context: This event is from ${districtName}.

Text from flyer:
${text}

Return ONLY valid JSON in this exact format, no markdown, no explanation:
{
  "title": "Event Title",
  "eventDate": "2025-10-15T19:00:00",
  "location": "Venue Name and Address",
  "description": "Event description",
  "organizer": "Organizer Name"
}`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.1:latest',
        prompt: prompt,
        stream: false,
        format: 'json',
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const result = await response.json();
    const jsonText = result.response.trim();

    // Parse the JSON response
    const eventData = JSON.parse(jsonText) as EventData;

    // Validate required fields
    if (!eventData.title || !eventData.eventDate || !eventData.location) {
      return {
        event: null,
        success: false,
        error: 'Missing required fields in parsed data',
      };
    }

    return {
      event: eventData,
      success: true,
    };
  } catch (error) {
    return {
      event: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error parsing event',
    };
  }
}
