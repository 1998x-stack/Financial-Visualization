# Optional production adapter: ECharts + D3

This is an actual **ECharts 6 SVG renderer** + **D3-Sankey** integration. Unlike \`examples/demo/\`, it requires a package install/build step.

\`\`\`bash
cd examples/echarts-d3
npm install --no-audit --no-fund
npm run dev    # open local Vite URL
npm run build  # static deployment bundle in dist/
\`\`\`

The dependency versions are explicit in \`package.json\`. For lockfile-reproducible production deployment, **commit the generated package-lock.json** and replace \`npm install\` with \`npm ci\`.

It imports the shared \`../demo/financials.json\` synthetic fixture; do not embed synthetic values into real-company reports. The D3 Sankey reconciles revenue, cost, gross profit, expenses and net profit before rendering. ECharts renders bars/lines into SVG, not Canvas. Labels and source table need to be expanded for a real filing, with exact filing page/locator and as-of quotes.

Bundling a JS dependency does not make an asset universally offline: verify the built \`dist/\` with network disabled and confirm all assets use relative/local URLs.