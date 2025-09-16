import { Component, AfterViewInit, ElementRef, ViewChild, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import * as go from 'gojs';

@Component({
  selector: 'app-approval-roadmap-diagram',
  templateUrl: './approval-roadmap-diagram.component.html',
  styleUrls: ['./approval-roadmap-diagram.component.css']
})
export class ApprovalRoadmapDiagramComponent implements AfterViewInit, OnChanges {
  @ViewChild('diagramDiv', { static: true }) diagramDiv!: ElementRef;

  @Input() nodes: any[] = [];
  @Input() showDiagram: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  private diagram?: go.Diagram;

  ngAfterViewInit() {
    setTimeout(() => {
      this.initDiagram();
      this.updateDiagram();
    },10000);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateDiagram(); // ✅ safe to call, will init if needed
  }

  private initDiagram() {
    const $ = go.GraphObject.make;

    this.diagram = $(go.Diagram, this.diagramDiv.nativeElement, {
      layout: $(go.TreeLayout, { angle: 90, layerSpacing: 40 })
    });

    this.diagram.nodeTemplate =
      $(go.Node, 'Auto',
        $(go.Shape, 'RoundedRectangle',
          { fill: '#e0f7fa', strokeWidth: 1, width: 160, height: 40 }),
        $(go.TextBlock,
          {
            margin: 8,
            font: 'bold 12px sans-serif',
            stroke: 'black',
            textAlign: 'center',
            wrap: go.TextBlock.WrapFit,
            width: 150
          },
          new go.Binding('text', 'name'))
      );

    console.log("✅ Diagram initialized");
  }

  private updateDiagram() {
    console.log("nodes:", this.nodes);
    console.log("showDiagram:", this.showDiagram);
    console.log("diagram:", this.diagram);

    if (this.diagram && this.showDiagram && this.nodes?.length) {
      console.log("🔄 Updating diagram with nodes:", this.nodes);

      this.diagram.model = new go.TreeModel(this.nodes);

      this.diagram.startTransaction('layout');
      this.diagram.layoutDiagram(true);
      this.diagram.commitTransaction('layout');
    }
  }

  onClose() {
    this.closeModal.emit();
  }
}


