const NumberOfGrantsChart = ({ setCount, count }) => {

    return <div className="child">
      <div>NumberOfGrantsChart</div>
      <input></input>
      <button onClick={() => { setCount(count + 1) }}> click</button>
    </div>;
  };


  export default NumberOfGrantsChart;