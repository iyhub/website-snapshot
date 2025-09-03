<script lang="ts">
	import downloadSimple from "$lib/assets/download-simple.svg";
	let url = $state("https://github.com/iyhub/website-snapshot");
	let loading = $state(false);
	let imageData = $state("/screenshots/screenshot-github.png");
	let error = $state("");
	let progress = $state("");

	async function captureScreenshot() {
		if (!url) return;

		loading = true;
		error = "";
		imageData = "";
		progress = "Starting...";

		try {
			const response = await fetch("/api/screenshot/stream", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ url }),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const reader = response.body?.getReader();
			if (!reader) {
				throw new Error("No response body");
			}

			const decoder = new TextDecoder();

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split("\n");

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						try {
							const data = JSON.parse(line.slice(6));
							progress = data.message;

							if (data.status === "completed" && data.imageData) {
								imageData = data.imageData;
							} else if (data.status === "error") {
								error = data.message;
							}
						} catch (e) {
							console.warn("Failed to parse SSE data:", line);
						}
					}
				}
			}
		} catch (err) {
			error =
				err instanceof Error ? err.message : "Unknown error occurred";
		} finally {
			loading = false;
		}
	}

	async function captureScreenshotDirect() {
		if (!url) return;

		loading = true;
		error = "";
		imageData = "";
		progress = "Taking screenshot...";

		try {
			const response = await fetch(
				`/api/screenshot?url=${encodeURIComponent(url)}`,
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const blob = await response.blob();
			const imageUrl = URL.createObjectURL(blob);
			imageData = imageUrl;
			progress = "Screenshot completed";
		} catch (err) {
			error =
				err instanceof Error ? err.message : "Unknown error occurred";
		} finally {
			loading = false;
		}
	}

	function downloadImage() {
		if (!imageData || !url) return;

		const hostname = new URL(url).hostname;
		const timestamp = new Date().toISOString().slice(0, 10);
		const filename = `screenshot-${hostname}-${timestamp}.png`;

		const a = document.createElement("a");
		a.href = imageData;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
</script>

<main class="min-h-screen bg-gray-50 py-8 px-4">
	<div class="max-w-4xl mx-auto">
		<header class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">
				Free Website Screenshot Tool
			</h1>
			<p class="text-lg text-gray-600">
				Capture high-quality screenshots of any webpage instantly.
				Download as PNG with one click.
			</p>
		</header>

		<section class="bg-white rounded-lg shadow-md p-6">
			<h2 class="text-xl font-semibold text-gray-800 mb-4">API Usage</h2>

			<div class="space-y-4">
				<div>
					<h3 class="font-medium text-gray-700 mb-2">
						Direct API (return image)
					</h3>
					<code class="block bg-gray-100 p-3 rounded text-sm">
						GET /api/screenshot?url=https://example.com
					</code>
				</div>

				<!-- <div>
					<h3 class="font-medium text-gray-700 mb-2">
						Streaming API (Server-Sent Events)
					</h3>
					<code class="block bg-gray-100 p-3 rounded text-sm">
						POST /api/screenshot/stream<br />
						Content-Type: application/json<br />
						{'{"url": "https://example.com"}'}
					</code>
				</div> -->
			</div>
		</section>

		<section class="bg-white rounded-lg shadow-md p-6 mb-8 mt-8">
			<h2 class="text-xl font-semibold text-gray-800 mb-4">
				Capture Website Screenshot
			</h2>

			<div class="space-y-4">
				<label
					for="website-url"
					class="block text-sm font-medium text-gray-700 mb-1"
				>
					Website URL
				</label>
				<p id="url-help" class="text-xs text-gray-500">
					Enter the full URL including http:// or https://
				</p>
				<div class="flex items-center gap-2">
					<input
						id="website-url"
						type="url"
						bind:value={url}
						placeholder="https://example.com"
						required
						aria-describedby="url-help"
						class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>

					<button
						onclick={captureScreenshotDirect}
						disabled={loading || !url}
						class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? "Capturing..." : "Screenshot"}
					</button>
				</div>

				<div class="flex gap-2">
					<!-- <button
						onclick={captureScreenshot}
						disabled={loading || !url}
						class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? "Capturing..." : "Stream Screenshot"}
					</button> -->
				</div>

				{#if progress}
					<div
						class="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-md"
					>
						{progress}
					</div>
				{/if}

				{#if error}
					<div class="bg-red-50 border border-red-200 rounded-md p-4">
						<p class="text-red-700">Error: {error}</p>
					</div>
				{/if}

				{#if imageData}
					<div class="mt-6">
						<div class="flex items-center justify-between mb-2">
							<h3 class="text-lg font-medium text-gray-900">
								Screenshot Result
							</h3>
							<button
								onclick={downloadImage}
								class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green500 text-sm"
							>
								<span class="flex items-center gap-2">
									<img
										src={downloadSimple}
										alt="Download"
										class="w-4 h-4"
									/>
									Download
								</span>
							</button>
						</div>
						<img
							src={imageData}
							alt="Screenshot of {url}"
							class="w-full border border-gray-200 rounded-md"
						/>
					</div>
				{/if}
			</div>
		</section>
	</div>
</main>
