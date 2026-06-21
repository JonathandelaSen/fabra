import {
  BooleanFlag,
  Counter,
  LongText,
  ValueObject,
} from "@/backend/modules/shared";

export interface CVExtractionDiagnosticsPrimitives {
  filename: string | null;
  fileSize: number | null;
  pythonLength: number;
  pdfjsLength: number;
  nodeLength: number;
  pythonError: boolean;
  pdfjsError: boolean;
  nodeError: boolean;
}

export class CVExtractionDiagnostics extends ValueObject<CVExtractionDiagnosticsPrimitives> {
  private constructor(
    private readonly filenameValue: LongText | null,
    private readonly fileSizeValue: Counter | null,
    private readonly pythonLengthValue: Counter,
    private readonly pdfjsLengthValue: Counter,
    private readonly nodeLengthValue: Counter,
    private readonly pythonErrorValue: BooleanFlag,
    private readonly pdfjsErrorValue: BooleanFlag,
    private readonly nodeErrorValue: BooleanFlag,
  ) {
    super();
  }

  static fromPrimitives(
    primitives: CVExtractionDiagnosticsPrimitives,
  ): CVExtractionDiagnostics {
    return new CVExtractionDiagnostics(
      primitives.filename === null
        ? null
        : LongText.fromPrimitives(primitives.filename),
      primitives.fileSize === null
        ? null
        : Counter.fromPrimitives(primitives.fileSize),
      Counter.fromPrimitives(primitives.pythonLength),
      Counter.fromPrimitives(primitives.pdfjsLength),
      Counter.fromPrimitives(primitives.nodeLength),
      BooleanFlag.fromPrimitives(primitives.pythonError),
      BooleanFlag.fromPrimitives(primitives.pdfjsError),
      BooleanFlag.fromPrimitives(primitives.nodeError),
    );
  }

  toPrimitives(): CVExtractionDiagnosticsPrimitives {
    return {
      filename: this.filenameValue?.toPrimitives() ?? null,
      fileSize: this.fileSizeValue?.toPrimitives() ?? null,
      pythonLength: this.pythonLengthValue.toPrimitives(),
      pdfjsLength: this.pdfjsLengthValue.toPrimitives(),
      nodeLength: this.nodeLengthValue.toPrimitives(),
      pythonError: this.pythonErrorValue.toPrimitives(),
      pdfjsError: this.pdfjsErrorValue.toPrimitives(),
      nodeError: this.nodeErrorValue.toPrimitives(),
    };
  }
}
