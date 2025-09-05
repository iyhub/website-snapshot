import { error } from '@sveltejs/kit';
import { chromium, type Browser } from 'playwright';
import { dev } from '$app/environment';
import type { RequestHandler } from '@sveltejs/kit';

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
	if (!browserInstance) {
		console.log('Launching Chromium browser for API');
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

export const GET: RequestHandler = async ({ url: requestUrl }) => {
	return error(512, {
		message: "We are working on a better solution for you, please try again later"
	});
	const targetUrl = requestUrl.searchParams.get('url');
	const fullpage = requestUrl.searchParams.get('fullpage');

	if (!targetUrl) {
		return error(400, { message: 'URL parameter is required' });
	}

	try {
		const browser = await getBrowser();
		const page = await browser.newPage({
			userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Version/17.0 Safari/537.36',
			deviceScaleFactor: 2
		});

		await page.setViewportSize({ width: 1920, height: 1280 });
		await page.goto(targetUrl, {
			waitUntil: 'networkidle',
			timeout: 30000,
		});

		const screenshotBuffer = await page.screenshot({
			fullPage: fullpage === 'true',
			type: 'png'
		});

		await page.close();

		return new Response(screenshotBuffer, {
			headers: {
				'Content-Type': 'image/png',
				'Content-Disposition': `inline; filename="screenshot-${Date.now()}.png"`,
				'Cache-Control': 'no-cache'
			}
		});
	} catch (err) {
		console.error('Screenshot error:', err);
		return error(500, {
			message: err instanceof Error ? err.message : 'Failed to capture screenshot'
		});
	}
};

export const POST: RequestHandler = async ({ request }) => {
	const { url: targetUrl } = await request.json();
	return error(512, {
		message: "We are working on a better solution for you, please try again later"
	});

	if (!targetUrl) {
		return error(400, { message: 'URL is required in request body' });
	}

	try {
		const browser = await getBrowser();
		const page = await browser.newPage({
			userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Version/17.0 Safari/537.36',
			deviceScaleFactor: 2
		});

		await page.setViewportSize({
			width: 1920, height: 1280
		});
		await page.goto(targetUrl, {
			waitUntil: 'networkidle',
			timeout: 30000,
		});

		const screenshotBuffer = await page.screenshot({
			fullPage: false,
			type: 'png'
		});

		await page.close();

		return new Response(screenshotBuffer, {
			headers: {
				'Content-Type': 'image/png',
				'Content-Disposition': `inline; filename="screenshot-${Date.now()}.png"`,
				'Cache-Control': 'no-cache'
			}
		});
	} catch (err) {
		console.error('Screenshot error:', err);
		return error(500, {
			message: err instanceof Error ? err.message : 'Failed to capture screenshot'
		});
	}
};