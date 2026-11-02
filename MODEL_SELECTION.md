# Model Selection Matrix

## 1. Experimental Results

All three models were tested on the same Pong development task.

| Model | Provider | Time | Tokens | Cost | Tests Created | Result |
|---|---|---:|---:|---:|---:|---|
| Nemotron 3.5 Super VL Free | OpenCode | 5 min | 62k | $0.00 | 8 unit tests | All checks passed; weakest UI |
| Big Pickle Free | OpenCode | 10 min | 112.5k | $0.00 | 12 unit tests + 1 E2E | All checks passed; intermediate UI |
| DeepSeek V4.1 Flash 1017 | DeepSeek API | 12 min | 133.5k | $0.09 | 11 unit tests + 1 E2E | All checks passed; best UI |



## 2. Comparison

| Criterion | Nemotron 3.5 Super VL Free | Big Pickle Free | DeepSeek V4.1 Flash 1017 |
|---|---|---|---|
| Quality | Lowest UI quality in our tests | Intermediate UI quality | Best UI quality in our tests |
| Cost | Free | Free during evaluation | $0.09 per task |
| Latency | 5 min | 10 min | 12 min |
| Licence | OpenMDW-1.1; verify model-specific terms | Not publicly disclosed | MIT; verify applicable model terms |
| Data protection | Third-party hosted endpoint; review NVIDIA's data policy | OpenCode-hosted endpoint; review OpenCode's data policy | Direct API; review DeepSeek's API data policy |

## 3. Final Selection

**Selected model: DeepSeek V4.1 Flash 1017**

DeepSeek was selected because it produced the best UI quality in our experiments and successfully completed the required checks. Although it took longer and cost $0.09, the cost was negligible for this task.

Nemotron was faster and free but produced the weakest UI. Big Pickle was also free and generated more unit tests, but its UI quality was intermediate.

## 4. Limitations

- Results are based on one development task and are not a general benchmark.
- UI quality was evaluated subjectively.
- Token counts, execution times and costs are specific to our test runs.
- Licence and data protection conditions depend on the provider's applicable terms.

## 5. Sources

- OpenCode model catalogue: https://opencode.ai/v2/docs/console/models/
- NVIDIA Nemotron model card: https://build.nvidia.com/nvidia/nemotron-3.5-super-vl-120b-a12b/modelcard
- DeepSeek API documentation: https://api-docs.deepseek.com/
- DeepSeek privacy policy: https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html
