import { error } from '@sveltejs/kit';
import { chromium, type Browser } from 'playwright';
import { dev } from '$app/environment';
import type { RequestHandler } from '@sveltejs/kit';

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
	if (!browserInstance) {
		console.log('Launching browser for streaming API');
		browserInstance = await chromium.launch(!dev ? {
			executablePath: '/usr/bin/chromium-browser',
			args: [
				'--no-sandbox',
				'--disable-dev-shm-usage',
				'--font-render-hinting=none',
				'--disable-font-subpixel-positioning'
			]
		} : {});
	}
	return browserInstance;
}

export const POST: RequestHandler = async ({ request }) => {
	const { url: targetUrl } = await request.json();
	return error(512, {
		message: "We are working on a better solution for you, please try again later"
	});

	if (!targetUrl) {
		return error(400, { message: 'URL is required in request body' });
	}

	const stream = new ReadableStream({
		async start(controller) {
			const encoder = new TextEncoder();

			try {
				// 发送开始信号
				controller.enqueue(encoder.encode('data: {"status":"starting","message":"Launching browser..."}\n\n'));

				const browser = await getBrowser();
				const page = await browser.newPage();

				controller.enqueue(encoder.encode('data: {"status":"navigating","message":"Navigating to URL..."}\n\n'));

				await page.setViewportSize({ width: 1920, height: 1280 });
				await page.goto(targetUrl, {
					waitUntil: 'networkidle',
					timeout: 30000,
				});

				controller.enqueue(encoder.encode('data: {"status":"capturing","message":"Taking screenshot..."}\n\n'));

				const screenshotBuffer = await page.screenshot({
					fullPage: false,
					type: 'png'
				});

				await page.close();

				// 将图片转换为base64并发送
				const base64Image = screenshotBuffer.toString('base64');
				const imageData = {
					status: 'completed',
					message: 'Screenshot captured successfully',
					imageData: `data:image/png;base64,${base64Image}`,
					url: targetUrl
				};

				controller.enqueue(encoder.encode(`data: ${JSON.stringify(imageData)}\n\n`));
				controller.close();

			} catch (err) {
				const errorData = {
					status: 'error',
					message: err instanceof Error ? err.message : 'Failed to capture screenshot',
					url: targetUrl
				};
				controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
				controller.close();
			}
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': 'Content-Type'
		}
	});
};