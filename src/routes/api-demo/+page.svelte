<script lang="ts">
	let url = "";
	let loading = false;
	let imageData = "";
	let error = "";
	let progress = "";

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
</script>

<div class="min-h-screen bg-gray-50 py-8 px-4">
	<div class="max-w-4xl mx-auto">
		<h1 class="text-3xl font-bold text-gray-900 mb-8">
			Screenshot API Demo
		</h1>

		<div class="bg-white rounded-lg shadow-md p-6 mb-8">
			<h2 class="text-xl font-semibold text-gray-800 mb-4">
				Capture Website Screenshot
			</h2>

			<div class="space-y-4">
				<input
					type="url"
					bind:value={url}
					placeholder="https://example.com"
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>

				<div class="flex gap-2">
					<button
						onclick={captureScreenshotDirect}
						disabled={loading || !url}
						class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? "Capturing..." : "Direct Screenshot"}
					</button>

					<button
						onclick={captureScreenshot}
						disabled={loading || !url}
						class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? "Capturing..." : "Stream Screenshot"}
					</button>
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
						<h3 class="text-lg font-medium text-gray-900 mb-2">
							Screenshot Result
						</h3>
						<img
							src={imageData}
							alt="Screenshot of {url}"
							class="w-full border border-gray-200 rounded-md"
						/>
					</div>
				{/if}
			</div>
		</div>

		<div class="bg-white rounded-lg shadow-md p-6">
			<h2 class="text-xl font-semibold text-gray-800 mb-4">API Usage</h2>

			<div class="space-y-4">
				<div>
					<h3 class="font-medium text-gray-700 mb-2">
						Direct API (返回图片流)
					</h3>
					<code class="block bg-gray-100 p-3 rounded text-sm">
						GET /api/screenshot?url=https://example.com
					</code>
				</div>

				<div>
					<h3 class="font-medium text-gray-700 mb-2">
						Streaming API (Server-Sent Events)
					</h3>
					<code class="block bg-gray-100 p-3 rounded text-sm">
						POST /api/screenshot/stream<br />
						Content-Type: application/json<br />
						{'{"url": "https://example.com"}'}
					</code>
				</div>
			</div>
		</div>
	</div>
</div>
