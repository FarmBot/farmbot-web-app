import * as React from "react";
import { TaggedSequence } from "farmbot";
import { SequenceBodyItem } from "farmbot/dist";
import { DropArea } from "../draggable/drop_area";
import { StepDragger } from "../draggable/step_dragger";
import { renderCeleryNode } from "./step_tiles/index";
import { ResourceIndex } from "../resources/interfaces";
import { getStepTag } from "../resources/sequence_tagging";
import { HardwareFlags, FarmwareData } from "./interfaces";
import { ShouldDisplay } from "../devices/interfaces";
import { AddCommandButton } from "./sequence_editor_middle_active";
import { ErrorBoundary } from "../error_boundary";
import { TileUnknown } from "./step_tiles/tile_unknown";
import { hoverSequenceStep } from "../farm_designer/map/sequence_visualization";

export interface AllStepsProps {
  sequence: TaggedSequence;
  onDrop(index: number, key: string): void;
  dispatch: Function;
  resources: ResourceIndex;
  hardwareFlags?: HardwareFlags;
  farmwareData?: FarmwareData;
  shouldDisplay?: ShouldDisplay;
  confirmStepDeletion: boolean;
  showPins?: boolean;
  expandStepOptions?: boolean;
  viewCeleryScript?: boolean;
  visualized?: boolean;
  hoveredStep?: string | undefined;
}

export class AllSteps extends React.Component<AllStepsProps, {}> {
  render() {
    const { sequence, dispatch } = this.props;
    const items = (sequence.body.body || [])
      .map((currentStep: SequenceBodyItem, index) => {
        /** HACK: React's diff algorithm (probably?) can't keep track of steps
         * via `index` alone- the content is too dynamic (copy/splice/pop/push)
         * To get around this, we add a `uuid` property to Steps that
         * is guaranteed to be unique no matter where the step gets moved and
         * allows React to diff the list correctly. */
        const readThatCommentAbove = getStepTag(currentStep);
        const tag = readThatCommentAbove;
        const stepProps = {
          currentStep,
          index,
          dispatch,
          currentSequence: sequence,
          resources: this.props.resources,
          hardwareFlags: this.props.hardwareFlags,
          farmwareData: this.props.farmwareData,
          shouldDisplay: this.props.shouldDisplay,
          confirmStepDeletion: this.props.confirmStepDeletion,
          showPins: this.props.showPins,
          expandStepOptions: this.props.expandStepOptions,
          viewCeleryScript: this.props.viewCeleryScript,
        };
        return <div className="sequence-steps"
          key={readThatCommentAbove}>
          <AddCommandButton dispatch={dispatch} index={index} />
          <DropArea callback={key => this.props.onDrop(index, key)} />
          <StepDragger
            dispatch={dispatch}
            step={currentStep}
            intent="step_move"
            draggerId={index}>
            <div className={`sequence-step ${
              this.props.visualized && this.props.hoveredStep === tag
                ? "hovered" : ""}`}
              onMouseEnter={dispatch(hoverSequenceStep(tag))}
              onMouseLeave={dispatch(hoverSequenceStep(undefined))}>
              <ErrorBoundary fallback={<TileUnknown {...stepProps} />}>
                {renderCeleryNode(stepProps)}
              </ErrorBoundary>
            </div>
          </StepDragger>
        </div>;
      });

    return <div className="all-steps">{items}</div>;
  }
}
