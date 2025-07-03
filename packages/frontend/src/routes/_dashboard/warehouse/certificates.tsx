import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Folder, ArrowLeft, FileArchive } from "lucide-react";

const folderTypes = ["材質證明", "無輻射證明", "超音波證明"] as const;
type FolderType = (typeof folderTypes)[number];

const certificatesSearchSchema = z.object({
  folder: z.enum(folderTypes).optional(),
});

export const Route = createFileRoute("/_dashboard/warehouse/certificates")({
  validateSearch: certificatesSearchSchema,
  component: CertificatesPage,
});

const dummyFiles: Record<FolderType, { name: string; type: "pdf" | "zip" }[]> =
  {
    材質證明: [
      { name: "material-cert-001.pdf", type: "pdf" },
      { name: "material-cert-002.pdf", type: "pdf" },
    ],
    無輻射證明: [{ name: "radiation-free-cert-A.pdf", type: "pdf" }],
    超音波證明: [
      { name: "ultrasonic-test-report.zip", type: "zip" },
      { name: "ultrasonic-test-summary.pdf", type: "pdf" },
    ],
  };

function CertificatesPage() {
  const { folder: selectedFolder } = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleFolderClick = (folder: FolderType) => {
    navigate({
      search: { folder },
    });
  };

  const handleBack = () => {
    navigate({
      search: { folder: undefined },
    });
  };

  if (selectedFolder) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h2 className="text-2xl font-bold mb-4">{selectedFolder}</h2>
        <div className="grid gap-4">
          {dummyFiles[selectedFolder].map((file) => (
            <Card key={file.name}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  {file.type === "pdf" ? (
                    <FileText className="h-6 w-6 mr-4 text-red-500" />
                  ) : (
                    <FileArchive className="h-6 w-6 mr-4 text-yellow-500" />
                  )}
                  <span>{file.name}</span>
                </div>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex-shrink-0 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>上傳證明</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button>
              <Upload className="mr-2 h-4 w-4" /> 上傳 PDF
            </Button>
            <Button>
              <Upload className="mr-2 h-4 w-4" /> 上傳 ZIP
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...folderTypes].map((folder) => (
            <Card
              key={folder}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleFolderClick(folder)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <Folder className="h-16 w-16 mb-4 text-yellow-400" />
                <p className="font-semibold text-lg">{folder}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
