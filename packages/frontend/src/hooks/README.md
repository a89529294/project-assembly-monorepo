# File Upload Hooks

This directory contains hooks for handling file uploads and progress tracking in our application.

## Centralized Progress Tracking System

We've implemented a centralized progress tracking system that allows tracking multiple file uploads with different stages and weights. This approach eliminates redundant state management and provides a unified progress indicator.

### Core Components

1. **useMultiFileUploadProgress**: The central hook that manages progress tracking across multiple files and stages
2. **useFileUpload**: A generic hook for file uploads that accepts progress callbacks
3. **useBomUploadAndQueue**: A specialized hook for BOM file uploads and processing
4. **useNcUpload**: A specialized hook for NC file uploads

## Usage Example

```tsx
import { useMultiFileUploadProgress } from "@/hooks/use-multi-file-upload-progress";
import { useBomUploadAndQueue } from "@/hooks/use-bom-upload-and-queue";
import { useNcUpload } from "@/hooks/use-nc-upload";
import { Progress } from "@/components/ui/progress";

function MyUploadComponent() {
  // 1. Initialize the specialized upload hooks
  const { handleBomUploadAndQueue } = useBomUploadAndQueue();
  const { handleNcUpload } = useNcUpload();
  
  // 2. Setup the centralized progress tracking
  // - Define file IDs, weights, and number of stages for each file
  const { overallProgress, updateFileProgress, resetProgress } = useMultiFileUploadProgress([
    { fileId: 'bom', weight: 1, totalStages: 2 }, // BOM has upload + process stages
    { fileId: 'nc', weight: 1, totalStages: 1 }   // NC has only upload stage
  ]);

  const handleUpload = async (bom: File, nc: File) => {
    // Reset progress tracking before starting new uploads
    resetProgress();
    
    // Track completion status for navigation or further actions
    let bomUploadComplete = false;
    let ncUploadComplete = false;
    
    // Function to check if all uploads are complete
    const checkAllUploadsComplete = () => {
      if (bomUploadComplete && ncUploadComplete) {
        console.log("All uploads complete!");
        // Perform additional actions like navigation
      }
    };
    
    // Start uploads in parallel
    const uploadPromises = [];
    
    // BOM upload with progress callbacks
    const bomPromise = handleBomUploadAndQueue(
      { projectId: "project-123", bom },
      {
        // Track upload progress (first stage)
        onUploadProgress: (progress: number) => {
          updateFileProgress('bom', 'upload', progress);
        },
        // Track processing progress (second stage)
        onProcessProgress: (progress: number) => {
          updateFileProgress('bom', 'process', progress, 1);
        },
        // Handle completion
        onComplete: () => {
          updateFileProgress('bom', 'complete', 100, 1);
          bomUploadComplete = true;
          checkAllUploadsComplete();
        },
        // Handle errors
        onError: (error) => {
          updateFileProgress('bom', 'error', 0);
          console.error("BOM upload/process failed:", error);
        },
      }
    );
    uploadPromises.push(bomPromise);
    
    // NC upload with progress callbacks
    const ncPromise = handleNcUpload(
      { projectId: "project-123", nc },
      {
        // Track upload progress (only stage)
        onUploadProgress: (progress: number) => {
          updateFileProgress('nc', 'upload', progress);
        },
        // Handle completion
        onComplete: () => {
          updateFileProgress('nc', 'complete', 100);
          ncUploadComplete = true;
          checkAllUploadsComplete();
        },
        // Handle errors
        onError: (error) => {
          updateFileProgress('nc', 'error', 0);
          console.error("NC upload failed:", error);
        },
      }
    );
    uploadPromises.push(ncPromise);
    
    // Wait for all uploads to complete or fail
    try {
      await Promise.all(uploadPromises);
    } catch (error) {
      console.error("One or more uploads failed:", error);
    }
  };
  
  return (
    <div>
      {/* Display progress bar when uploads are in progress */}
      {overallProgress > 0 && overallProgress < 100 && (
        <div className="flex items-center gap-2">
          <span className="text-sm">
            上傳處理中... {overallProgress}%
          </span>
          <Progress value={overallProgress} className="w-[200px]" />
        </div>
      )}
      
      {/* Upload button */}
      <button onClick={() => handleUpload(bomFile, ncFile)}>
        Start Upload
      </button>
    </div>
  );
}
```

## Key Benefits

1. **Centralized State Management**: All progress tracking is managed in one place
2. **Weighted Progress**: Different files and stages can have different weights in the overall progress calculation
3. **Multiple Stages**: Supports tracking multiple stages per file (e.g., upload + processing)
4. **Parallel Uploads**: Handles multiple file uploads running in parallel
5. **Unified UI**: Provides a single progress value for the UI to display

## Implementation Details

### useMultiFileUploadProgress

This hook manages the overall progress tracking:

- `fileStatuses`: Array of status objects for each file being tracked
- `overallProgress`: Combined weighted progress value (0-100)
- `updateFileProgress`: Function to update progress for a specific file and stage
- `resetProgress`: Function to reset all progress tracking

### Specialized Upload Hooks

The specialized hooks (useBomUploadAndQueue, useNcUpload) have been simplified to:
- Accept callbacks for progress updates
- Not maintain their own state
- Focus on their specific upload and processing logic
