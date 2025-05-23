# Entity Field List

## 1. ProcessWorkDetail

**Inherits from AbstractAuditEntity**

### Fields from AbstractEntity

- `id`: string
- `createdAt`: Date
- `updatedAt`: Date
- `createdBy`: string
- `updatedBy`: string
- `deletedBy`: string | null

### Own Fields

- `name`: string
- `type`: string
- `processWorkType`: ProcessWorkType (ManyToOne)
- `checkTarget`: ProcessWorkType | null (ManyToOne, nullable)

---

## 2. ProcessWorkType

**Inherits from AbstractAuditEntity**

### Fields from AbstractEntity

- `id`: string
- `createdAt`: Date
- `updatedAt`: Date
- `createdBy`: string
- `updatedBy`: string
- `deletedBy`: string | null

### Own Fields

- `name`: string
- `startAt`: Date | null
- `endAt`: Date | null
- `sequence`: number
- `queue`: number (default: 20)
- `project`: Project (ManyToOne)
- `processWorkDetails`: ProcessWorkDetail[] (OneToMany)
- `workers`: Employee[] (ManyToMany)
- `checkDetails`: ProcessWorkDetail[] (OneToMany, nullable)
- `projectAssemblyProcesses`: ProjectAssemblyProcess[] (OneToMany)
- `projectSubStatistic`: ProjectSubStatistic (OneToOne)
- `deletedAt`: Date (from SoftDeletableAuditEntity)

---

## 3. ProjectAssemblyLocation

**Inherits from AbstractAuditEntity**

### Fields from AbstractEntity

- `id`: string
- `createdAt`: Date
- `updatedAt`: Date
- `createdBy`: string
- `updatedBy`: string
- `deletedBy`: string | null

### Own Fields

- `district`: string
- `projectAssemblySubLocations`: ProjectAssemblySubLocation[] (OneToMany)

---

## 4. ProjectAssemblySubLocation

**Inherits from AbstractAuditEntity**

### Fields from AbstractEntity

- `id`: string
- `createdAt`: Date
- `updatedAt`: Date
- `createdBy`: string
- `updatedBy`: string
- `deletedBy`: string | null

### Own Fields

- `name`: string
- `projectAssemblyLocation`: ProjectAssemblyLocation (ManyToOne)
- `projectAssemblies`: ProjectAssembly[] (OneToMany)

---

## 5. ProjectAssemblyProcess

**Inherits from AbstractAuditEntity**

### Fields from AbstractEntity

- `id`: string
- `createdAt`: Date
- `updatedAt`: Date
- `createdBy`: string
- `updatedBy`: string
- `deletedBy`: string | null

### Own Fields

- `name`: string
- `operateDate`: Date | null
- `detailName`: string | null
- `detailStatus`: string | null
- `sequence`: number | null
- `queue`: number (default: 20)
- `memo1`: string | null
- `memo2`: string | null
- `memo3`: string | null
- `memo4`: string | null
- `projectAssemblyId`: string | null
- `worker`: Employee | null (ManyToOne, nullable)
- `processWorkType`: ProcessWorkType | null (ManyToOne, nullable)
- `projectAssembly`: ProjectAssembly (ManyToOne)

---

## 6. ProjectAssembly

**Inherits from AbstractAuditEntity**

### Fields from AbstractEntity

- `id`: string
- `createdAt`: Date
- `updatedAt`: Date
- `createdBy`: string
- `updatedBy`: string
- `deletedBy`: string | null

### Own Fields

- `tagId`: string (unique)
- `assemblyId`: string
- `name`: string
- `installPosition`: string
- `installHeight`: string (decimal)
- `areaType`: string
- `transportNumber`: string | null
- `transportDesc`: string | null
- `tagTransportNumber`: string | null
- `drawingName`: string
- `totalWidth`: string (decimal)
- `totalHeight`: string (decimal)
- `totalLength`: number (decimal)
- `totalWeight`: string (decimal)
- `totalArea`: string (decimal)
- `specification`: string
- `material`: string
- `type`: string (indexed)
- `memo1`: string | null
- `memo2`: string | null
- `vehicleIdentificationNumber`: string | null
- `shippingNumber`: string | null
- `shippingDate`: Date | null
- `change`: string | null (enum: ProjectAssemblyChangeStatus)
- `replaced`: ProjectAssembly | null (OneToOne, self-reference)
- `replacement`: ProjectAssembly | null (OneToOne, self-reference)
- `projectParts`: ProjectParts[] (OneToMany)
- `projectAssemblyProcesses`: ProjectAssemblyProcess[] (OneToMany)
- `project`: Project (ManyToOne)
- `projectAssemblySubLocation`: ProjectAssemblySubLocation | null (ManyToOne, nullable)
- `materialRelations`: Material[] (ManyToMany)

---

## 7. ProjectParts

**Inherits from AbstractAuditEntity**

### Fields from AbstractEntity

- `id`: string
- `createdAt`: Date
- `updatedAt`: Date
- `createdBy`: string
- `updatedBy`: string
- `deletedBy`: string | null

### Own Fields

- `name`: string
- `specification`: string
- `type`: string
- `length`: number (decimal)
- `height`: number (decimal)
- `width`: number (decimal)
- `t1`: number (decimal)
- `t2`: number (decimal)
- `material`: string
- `weight`: number (decimal)
- `area`: number (decimal)
- `drawingName`: string
- `projectAssembly`: ProjectAssembly (ManyToOne)

---

## 8. ProjectStatistic

**Inherits from AbstractEntity**

### Fields from AbstractEntity

- `id`: string
- `createdAt`: Date
- `updatedAt`: Date

### Own Fields

- `projectTotalWeight`: number (decimal)
- `projectTotalQuantity`: number (decimal)
- `projectCompleteTotalWeight`: number (decimal)
- `projectCompleteTotalQuantity`: number (decimal)
- `project`: Project (OneToOne)
- `subStatistics`: ProjectSubStatistic[] (OneToMany)

---

## 9. ProjectSubStatistic

**Inherits from AbstractEntity**

### Fields from AbstractEntity

- `id`: string
- `createdAt`: Date
- `updatedAt`: Date

### Own Fields

- `name`: string
- `errorRate`: number (decimal)
- `completeRate`: number (decimal)
- `averageOutput`: number (decimal)
- `averageOutputWeight`: number (decimal)
- `completeWeight`: number (decimal)
- `totalWeight`: number (decimal)
- `completeQuantity`: number
- `totalQuantity`: number
- `workDuration`: number
- `workDays`: string (JSON)
- `projectStatistic`: ProjectStatistic (ManyToOne)
- `processWorkType`: ProcessWorkType (OneToOne)
- `completedProjectAssemblies`: ProjectSubStatisticCompletedAssembly[] (OneToMany)

---

## 10. ProjectSubStatisticCompletedAssembly

**Inherits from AbstractEntity**

### Fields from AbstractEntity

- `id`: string
- `createdAt`: Date
- `updatedAt`: Date

### Own Fields

- `completedProjectSubStatisticCompletedAssemblyId`: string (primary key)
- `id`: string
- `tagId`: string (unique)
- `assemblyId`: string
- `name`: string
- `installPosition`: string
- `installHeight`: string (decimal)
- `areaType`: string
- `transportNumber`: string | null
- `transportDesc`: string | null
- `tagTransportNumber`: string | null
- `drawingName`: string
- `totalWidth`: string (decimal)
- `totalHeight`: string (decimal)
- `totalLength`: number (decimal)
- `totalWeight`: string (decimal)
- `totalArea`: string (decimal)
- `specification`: string
- `material`: string
- `type`: string (indexed)
- `memo1`: string | null
- `memo2`: string | null
- `vehicleIdentificationNumber`: string | null
- `shippingNumber`: string | null
- `shippingDate`: Date | null
- `change`: string | null (enum: ProjectAssemblyChangeStatus)
- `completedSubStatistic`: ProjectSubStatistic (ManyToOne)

---

## Key Observations

### Audit Fields

- Most entities inherit from `AbstractAuditEntity` which provides `createdBy`, `updatedBy`, and `deletedBy` fields
- `ProjectStatistic`, `ProjectSubStatistic`, and `ProjectSubStatisticCompletedAssembly` only inherit from `AbstractEntity`, so they don't have the audit fields

### Soft Delete

- `ProcessWorkType` implements `SoftDeletableAuditEntity` and has a `deletedAt` field
- Other entities might have soft delete through `@DeleteDateColumn()` if they extend `AbstractAuditEntity`

### Relationships

- Many entities have bidirectional relationships that need to be properly set up in the database schema
- Pay special attention to self-referential relationships (like in `ProjectAssembly`)

### Decimal Fields

- Many numeric fields are stored as decimals with precision 11 and scale 2

### Enums

- `ProjectAssemblyChangeStatus` is used in multiple places for the `change` field

Entities that extend AbstractAuditEntity:
ProcessWorkDetail
ProcessWorkType (also implements SoftDeletableAuditEntity)
ProjectAssemblyLocation
ProjectAssemblySubLocation
ProjectAssemblyProcess
ProjectAssembly
ProjectParts
Entities that only extend AbstractEntity:
ProjectStatistic
ProjectSubStatistic
ProjectSubStatisticCompletedAssembly
Total Count:
7 entities extend AbstractAuditEntity
3 entities extend only AbstractEntity

export type AuditableEntity = {
createdBy: string;

updatedBy: string;

deletedBy?: string | null;
} & Record<string | number | symbol, any>;

export type SoftDeletableEntity = {
deletedAt?: Date | null;
} & Record<string | number | symbol, any>;
