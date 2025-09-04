import { fail } from '@sveltejs/kit';
import { chromium, type Browser } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { Actions } from '@sveltejs/kit';

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
	if (!browserInstance) {
		console.log('launching browser');
		browserInstance = await chromium.launch();
	}
	return browserInstance;
}

interface Screenshot {
	url: string;
	success: boolean;
	filename?: string;
	error?: string;
}

export const actions: Actions = {
	screenshot: async ({ request }) => {
		const data = await request.formData();
		const urls = data.getAll('urls') as string[];

		return fail(512, {
			message: "We are working on a better solution for you, please try again later"
		});

		if (!urls || urls.length === 0) {
			return fail(400, { error: 'No URLs provided' });
		}

		const screenshotsDir = join(process.cwd(), 'static', 'screenshots');
		if (!existsSync(screenshotsDir)) {
			mkdirSync(screenshotsDir, { recursive: true });
		}

		const browser = await getBrowser();
		let screenshots: Screenshot[] = [];

		try {
			const screenshotPromises = urls
				.filter(url => url.trim())
				.map(async (url): Promise<Screenshot> => {
					const screenshot: Screenshot = {
						url,
						success: false
					};

					try {
						const page = await browser.newPage();

						await page.setViewportSize({ width: 1920, height: 1280 });

						await page.goto(url, {
							waitUntil: 'networkidle',
							timeout: 30000,
						});

						const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
						const filename = `screenshot-${timestamp}-${Math.random().toString(36).substring(2, 11)}.png`;
						const filepath = join(screenshotsDir, filename);

						await page.screenshot({
							path: filepath,
							fullPage: false,
							type: 'png'
						});

						await page.close();

						screenshot.success = true;
						screenshot.filename = filename;
					} catch (error) {
						screenshot.error = error instanceof Error ? error.message : 'Unknown error occurred';
					}

					return screenshot;
				});

			screenshots = await Promise.all(screenshotPromises);
		} finally {
			// 不关闭浏览器，保持实例复用
		}

		return {
			screenshots
		};
	}
};