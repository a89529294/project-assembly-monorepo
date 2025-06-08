import { useState, useMemo, useCallback, useRef } from "react";

export type FileId =
  | "bom"
  | "nc"
  | "constructorPDF"
  | "installedPlanePDF"
  | "designedPlanePDF";

export type FileUploadStatus = {
  fileId: FileId;
  stage: "upload" | "process" | "complete" | "error";
  progress: number;
  weight: number;
  totalStages: number;
  currentStageIndex: number;
};

export type FileProgressConfig = {
  fileId: FileId;
  weight: number;
  totalStages: number;
};

export function useMultiFileUploadProgress() {
  const fileConfigsRef = useRef<FileProgressConfig[]>([]);
  const fileConfigsMapRef = useRef<Map<string, FileProgressConfig>>(new Map());

  fileConfigsRef.current.forEach((config) =>
    fileConfigsMapRef.current.set(config.fileId, config)
  );

  const [fileStatuses, setFileStatuses] = useState<
    Map<string, FileUploadStatus>
  >(new Map());

  const setupFileConfigs = useCallback((configs: FileProgressConfig[]) => {
    fileConfigsRef.current = configs;
  }, []);

  // Calculate overall progress
  const overallProgress = (() => {
    const configMap = fileConfigsMapRef.current;
    if (configMap.size === 0) return 0;

    let totalWeightedProgress = 0;
    let totalWeight = 0;

    // Calculate for all configured files
    configMap.forEach((config, fileId) => {
      const status = fileStatuses.get(fileId);

      let fileProgress = 0;
      if (status) {
        // Calculate progress across all stages
        fileProgress =
          (status.currentStageIndex + status.progress / 100) /
          status.totalStages;
      }
      // If no status yet, fileProgress remains 0 (which is correct)

      totalWeightedProgress += fileProgress * config.weight;
      totalWeight += config.weight;
    });

    console.log(totalWeightedProgress);
    console.log(totalWeight);

    const calculatedProgress =
      totalWeight > 0 ? (totalWeightedProgress / totalWeight) * 100 : 0;

    return Math.round(calculatedProgress * 10) / 10;
  })();

  const updateFileProgress = useCallback(
    (
      fileId: FileId,
      stage: "upload" | "process" | "complete" | "error",
      progress: number,
      stageIndex?: number
    ) => {
      setFileStatuses((prev) => {
        const config = fileConfigsRef.current.find((c) => c.fileId === fileId);
        if (!config) {
          console.error(`No config found for file ID: ${fileId}`);
          return prev; // Skip if no config for this file
        }

        const newMap = new Map(prev);
        const existingStatus = newMap.get(fileId);

        // Create or update status
        const newStatus: FileUploadStatus = {
          fileId,
          stage,
          progress: Math.min(100, Math.max(0, progress)),
          weight: config.weight,
          totalStages: config.totalStages,
          currentStageIndex:
            stageIndex ?? (existingStatus?.currentStageIndex || 0),
        };

        // Auto-increment stage index based on stage if not explicitly provided
        if (stageIndex === undefined) {
          if (
            stage === "process" &&
            (!existingStatus || existingStatus.stage === "upload")
          ) {
            newStatus.currentStageIndex = 1;
            console.log(`Auto-incrementing stage index to 1 for ${fileId}`);
          } else if (stage === "complete") {
            newStatus.currentStageIndex = config.totalStages - 1;
            console.log(
              `Setting stage index to ${config.totalStages - 1} for completed ${fileId}`
            );
          }
        }

        newMap.set(fileId, newStatus);

        return newMap;
      });
    },
    []
  );

  const resetProgress = useCallback(() => {
    setFileStatuses(new Map());
  }, []);

  // Convert Map to array for external consumption
  const fileStatusArray = useMemo(
    () => Array.from(fileStatuses.values()),
    [fileStatuses]
  );

  return {
    fileStatuses: fileStatusArray,
    overallProgress,
    updateFileProgress,
    resetProgress,
    setupFileConfigs,
  };
}
