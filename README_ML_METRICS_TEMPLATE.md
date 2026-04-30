# ML Metrics Section Template

Add this section to the main `README.md` after you calculate the real values from the test set.

## Model Evaluation

| Metric | Value |
|---|---:|
| Accuracy | TODO |
| Precision | TODO |
| Recall | TODO |
| F1-score | TODO |
| ROC-AUC | TODO |

## Classification Threshold

Current threshold: `0.5`.

This threshold should be justified with ROC/PR analysis. Recommended explanation format:

> The classification threshold was selected after comparing ROC and Precision-Recall curves on the validation/test set. The selected threshold provides the best balance between false positives and false negatives for the project goal.

## Confusion Matrix

|  | Predicted Real | Predicted AI |
|---|---:|---:|
| Actual Real | TN | FP |
| Actual AI | FN | TP |

## Notes for Defense

- Explain which dataset was used for real images.
- Explain which dataset/generators were used for AI images.
- Explain how train/test split was created.
- Explain why the selected threshold is better than blindly using `0.5`.
