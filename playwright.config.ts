import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	testDir: 'e2e',
	projects: [
		{
			name: 'Desktop Safari',
			use: { ...devices['Desktop Safari'] }
		}
	]
});
