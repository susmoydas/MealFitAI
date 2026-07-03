import { Env } from '../types';
import { getRecentLogs, getUser } from '../services/db';

export async function handleCheckNotifications(request: Request, env: Env): Promise<Response> {
  try {
    const body: any = await request.json();
    const { userId } = body;

    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 });
    }

    const user = await getUser(userId, env);
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const notifications: { type: string; message: string }[] = [];
    const recentLogs = await getRecentLogs(userId, 72, env);

    // Repetition nudge: same protein_tag logged 2+ times in a row
    const recentProteins = recentLogs.slice(0, 5).map(l => l.protein_tag);
    if (recentProteins.length >= 2) {
      const lastTwo = recentProteins.slice(0, 2);
      if (lastTwo[0] === lastTwo[1]) {
        notifications.push({
          type: 'repetition',
          message: `You've had ${lastTwo[0]} the last two times. Try something different!`,
        });
      }
    }

    return Response.json(notifications);
  } catch (e) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
