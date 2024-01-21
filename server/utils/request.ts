import type { EventHandlerRequest, H3Event } from 'h3';
import crypto from 'crypto';

export function getIpAdress(event: H3Event<EventHandlerRequest>): string {
	const headers = event.headers;
	const xForwardedFor = headers.get('x-forwarded-for');
	const xRealIp = headers.get('x-real-ip');
	const hash = crypto.createHash('sha256').update(JSON.stringify(Array.from(headers.entries()))).digest('hex');
	return xRealIp ?? xForwardedFor ?? event.context.clientAddress ?? hash;
}
