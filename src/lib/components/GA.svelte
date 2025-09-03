<script lang="ts">
    import { PUBLIC_GA_ID } from "$env/static/public";
</script>

<svelte:head>
    <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${PUBLIC_GA_ID}`}
    ></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() {
            dataLayer.push(arguments);
        }
        gtag("js", new Date());

        gtag("config", { PUBLIC_GA_ID });
    </script>
</svelte:head>
