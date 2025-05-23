interface NcFile {
  name: string;
  fullName: string;
  content: string;
}

declare abstract class BomItem {
  protected readonly project: Project;
  readonly id: string;
  constructor(project: Project, id: string);
  abstract get materialType(): string;
  abstract specSameAs(item: this): boolean;
  abstract toString(): string;
}

interface NcBO {
  id: string;
  type: string;
  facing: string;
  x: string;
  y: string;
  z: string;
}

declare class NC {
  name: string;
  specification: string;
  length: string;
  material: string;
  body: string;
  bo: NcBO[];
  constructor(data: {
    name: string;
    specification: string;
    length: string;
    material: string;
    body: string;
    bo: NcBO[];
  });
}

interface PartData {
  id: string;
  name: string;
  specification: string;
  type: string;
  length: string;
  height: string;
  width: string;
  t1: string;
  t2: string;
  material: string;
  weight: string;
  area: string;
  drawingName: string;
  nc?: NC;
}
declare class Part extends BomItem {
  name: string;
  specification: string;
  type: string;
  length: string;
  height: string;
  width: string;
  t1: string;
  t2: string;
  material: string;
  weight: string;
  area: string;
  drawingName: string;
  nc?: NC;
  bolts: NcBO[];
  constructor(project: Project, data: PartData);
  get materialType(): string;
  specSameAs(item: this): boolean;
  toString(): string;
}

interface BoltData {
  id: string;
  name: string;
  type: string;
  material: string;
  quantity: string;
  weight: string;
}
declare class Bolt extends BomItem {
  name: string;
  type: string;
  material: string;
  quantity: string;
  weight: string;
  constructor(project: Project, data: BoltData);
  get materialType(): string;
  specSameAs(item: this): boolean;
  toString(): string;
}

interface AssemblyData {
  id: string;
  installPosition: string;
  installHeight: string;
  name: string;
  areaType: string;
  transportNumber: string;
  transportDesc: string;
  drawingName: string;
  totalWidth: string;
  totalHeight: string;
  totalLength: string;
  totalWeight: string;
  totalArea: string;
  memo: string;
  mainPartId: string;
  mainPartName: string;
  mainPartSpecification: string;
  mainPartType: string;
  mainPartLength: string;
  mainPartHeight: string;
  mainPartWidth: string;
  mainPartT1: string;
  mainPartT2: string;
  mainPartMaterial: string;
  mainPartWeight: string;
  mainPartArea: string;
  mainPartDrawingName: string;
}
declare class Assembly extends BomItem {
  name: string;
  installPosition: string;
  installHeight: string;
  areaType: string;
  transportNumber: string;
  transportDesc: string;
  drawingName: string;
  totalWidth: string;
  totalHeight: string;
  totalLength: string;
  totalWeight: string;
  totalArea: string;
  memo: string;
  parts: Part[];
  bolts: Bolt[];
  studs: Bolt[];
  partCounts: Record<string, number>;
  boltCounts: Record<string, number>;
  studCounts: Record<string, number>;
  mainPart: Part;
  constructor(project: Project, data: AssemblyData);
  get materialType(): string;
  addPart(part: Part): void;
  addBolt(bolt: Bolt): void;
  specSameAs(item: this): boolean;
  toString(): string;
}

interface ProjectOptions {
  encoding: string;
  ignoreSpecConflict: boolean;
  ignoreNcSpecNotMatch: boolean;
}
declare class Project {
  bomFile: string;
  bomContent: string;
  ncFiles: NcFile[];
  items: {
    assemblies: Assembly[];
    parts: Part[];
    bolts: Bolt[];
    studs: Bolt[];
  };
  specs: {
    assemblies: Record<string, Assembly>;
    parts: Record<string, Part>;
    bolts: Record<string, Bolt>;
    studs: Record<string, Bolt>;
    nc: Record<string, NC>;
  };
  readonly _options: ProjectOptions;
  private constructor();
  private static mergeDefaultOptions;
  private static readNcDir;
  static fromFiles(
    bomFilePath: string,
    ncFilePaths: string[],
    options?: ProjectOptions
  ): Promise<Project>;
  static fromBomFileAndNcDir(
    bomFilePath: string,
    ncDir: string,
    options?: ProjectOptions
  ): Promise<Project>;
  static fromProjectDir(
    dir: string,
    options?: ProjectOptions
  ): Promise<Project>;
  static fromJson(json: string, options?: ProjectOptions): Project;
  get options(): ProjectOptions;
  addAssembly(assembly: Assembly): void;
  addPart(part: Part): void;
  addBolt(bolt: Bolt): void;
  getSpec(item: BomItem): BomItem | undefined;
  getAssemblySpec(name: string): Assembly | undefined;
  getPartSpec(name: string): Part | undefined;
  getBoltSpec(type: string, name: string): Bolt | undefined;
  getNC(name: string): NC | undefined;
}

interface OutputResult {
  /**
   * 版號
   */
  version: string;
  /**
   * 根節點
   */
  root: Root;
  /**
   * 構件樣板陣列
   */
  assemblyTemplates: AssemblyTemplate[];
  /**
   * 零件樣板陣列
   */
  partTemplates: PartTemplate[];
  /**
   * 螺絲接頭樣板陣列
   */
  boltTemplates: BoltTemplate[];
  /**
   * 剪力釘接頭樣板陣列
   */
  studTemplates: StudTemplate[];
  /**
   * 客制接頭樣板陣列
   */
  customTemplates: any[];
  /**
   * 建立時間
   */
  createdAt: string;
}
interface Root {
  /**
   * 構件陣列
   */
  assemblies: AssemblyResult[];
}
interface AssemblyResult {
  /**
   * ID
   */
  id: string;
  /**
   * 構件編號
   */
  name: string;
  /**
   * 安裝位置
   */
  installPosition: string;
  /**
   * 安裝高程
   */
  installHeight: number;
  /**
   * 區別
   */
  areaType: string;
  /**
   * 拆運號碼
   */
  transportNumber: string;
  /**
   * 拆運說明
   */
  transportDesc: string;
  /**
   * 備註
   */
  memo: string;
  /**
   * 主零件
   */
  mainPart: AssemblyResultMainPart;
  /**
   * 零件陣列
   */
  parts: PartResult[];
}
type AssemblyResultMainPart = Pick<
  PartTemplate,
  "specification" | "material" | "type"
>;
interface PartResult {
  /**
   * ID
   */
  id: string;
  /**
   * 構件編號
   */
  name: string;
  /**
   * 已經測試
   */
  isTested: boolean;
  /**
   * 已加工完成
   */
  isCompleted: boolean;
}
interface AssemblyTemplate {
  /**
   * 構件編號
   */
  name: string;
  /**
   * 圖面名稱
   */
  drawingName: string;
  /**
   * 總寬度
   */
  totalWidth: number;
  /**
   * 總高度
   */
  totalHeight: number;
  /**
   * 總長度
   */
  totalLength: number;
  /**
   * 總重量
   */
  totalWeight: number;
  /**
   * 總面積
   */
  totalArea: number;
  /**
   * 零件樣板陣列
   */
  partTemplates: {
    name: string;
    count: number;
  }[];
  /**
   * 螺絲樣板陣列
   */
  boltTemplates: {
    name: string;
    count: number;
  }[];
  /**
   * 剪力釘樣板陣列
   */
  studTemplates: {
    name: string;
    count: number;
  }[];
  /**
   * 自訂接頭樣板陣列
   */
  customTemplates: any[];
  /**
   * 擴充資訊
   */
  extension: any[];
}
interface PartTemplate {
  /**
   * 零件編號
   */
  name: string;
  /**
   * 斷面規格
   */
  specification: string;
  /**
   * 類型
   */
  type: string;
  /**
   * 長度
   */
  length: number;
  /**
   * 高度
   */
  height: number;
  /**
   * 寬度
   */
  width: number;
  /**
   * t1
   */
  t1: number;
  /**
   * t2
   */
  t2: number;
  /**
   * 材質
   */
  material: string;
  /**
   * 單位重
   */
  weight: number;
  /**
   * 面積
   */
  area: number;
  /**
   * 圖面名稱
   */
  drawingName: string;
  /**
   * nc檔輪廓描述
   */
  nc: string | undefined;
  /**
   * 零件中孔群陣列
   */
  bolts: {
    /**
     * ID
     */
    id: string;
    /**
     * 類型
     */
    type: string;
    /**
     * 面
     */
    facing: string;
    x: string;
    y: string;
    z: string;
  }[];
}
interface BoltTemplate {
  /**
   * 材質規格
   */
  name: string;
  /**
   * 類型
   */
  type: string;
  /**
   * 材質
   */
  material: string;
  /**
   * 單位重
   */
  weight: number;
}
interface StudTemplate {
  /**
   * 材質規格
   */
  name: string;
  /**
   * 類型
   */
  type: string;
  /**
   * 材質
   */
  material: string;
  /**
   * 單位重
   */
  weight: number;
}

declare function transform(project: Project): OutputResult;

export { Project, ProjectOptions, transform };
