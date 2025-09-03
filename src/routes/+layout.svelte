<script lang="ts">
	import "../app.css";
	import favicon from "$lib/assets/favicon.svg";

	let { children } = $props();
</script>

<svelte:head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta
		name="description"
		content="Free website screenshot tool - Capture screenshots of any website instantly. High-quality PNG downloads with streaming progress."
	/>
	<meta name="author" content="Website Screenshot Tool" />
	<meta name="robots" content="index, follow" />

	<meta property="og:type" content="website" />
	<meta
		property="og:title"
		content="Website Screenshot Tool - Capture Any Webpage"
	/>
	<meta
		property="og:description"
		content="Free website screenshot tool - Capture screenshots of any website instantly. High-quality PNG downloads with streaming progress."
	/>
	<meta property="og:image" content="/favicon.svg" />

	<meta name="twitter:card" content="summary" />
	<meta
		name="twitter:title"
		content="Website Screenshot Tool - Capture Any Webpage"
	/>
	<meta
		name="twitter:description"
		content="Free website screenshot tool - Capture full-page screenshots of any website instantly."
	/>

	<link rel="icon" href={favicon} />

	<title>Website Screenshot Tool - Free Online Screenshot Capture</title>

	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "WebApplication",
			"name": "Website Screenshot Tool",
			"description": "Free online tool to capture high-quality screenshots of any webpage. Download PNG images instantly.",
			"url": "/",
			"applicationCategory": "UtilityApplication",
			"operatingSystem": "Web",
			"offers": {
				"@type": "Offer",
				"price": "0",
				"priceCurrency": "USD"
			},
			"featureList": [
				"Full-page screenshot capture",
				"Instant PNG download",
				"Streaming progress updates",
				"High-quality image output"
			]
		}
	</script>
</svelte:head>

{@render children?.()}
