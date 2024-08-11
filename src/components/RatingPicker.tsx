import _ from "lodash";

type Props = {
  range: { start: number; end: number };
  selectedValue?: number;
  onSelect: (value: number) => void;
};

export const RatingPicker = (props: Props) => {
  return (
    <div className={"flex flex-row gap-1"}>
      {_.range(props.range.start, props.range.end + 1).map((rating) => (
        <RatingButton
          key={rating}
          rating={rating}
          isSelected={rating === props.selectedValue}
          onClick={() => props.onSelect(rating)}
        />
      ))}
    </div>
  );
};

const RatingButton = (props: {
  rating: number;
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={props.onClick}
      className={`border-2 leading-none rounded w-12 h-12 ${props.isSelected ? "bg-indigo-500 border-indigo-500 text-white" : "bg-gray-100 border-gray-200"}`}
    >
      {props.rating}
    </button>
  );
};
