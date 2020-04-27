import React, { Component, useState, useEffect } from "react";
import SudoKu from "./Sudoku";

/**
 * 数独游戏react的实现
 *
 * 思路：
 * 1.封装一个专门生成数独的类最数据逻辑处理
 * 2.取出数独数据进行备份渲染, 正确答案和空白的数独保存在一个Map集合中
 * 3.当输入的值不合法进行清空
 * 4.当验证答案时取出Map集合的正确答案和用户输入的答案对比，完全正确则弹窗反馈否则不做任何反馈
 * 5.重新生成数独直接调用数独类的生成方法即可
 * 6.显示正确结果时直接取已经缓存的完整数独阵列进行渲染
 *
 * 目前实现的功能：
 * 1.数独矩阵生成
 * 2.对数独进行随机遮挡
 * 3.数独难度0-8级设置
 * 4.显示正确的答案
 * 5.重新生成数独矩阵
 *
 * 待优化：
 * 1.数独的检查应该封装到数独类内部
 * 2.输入错误的值进行错误反馈
 * 3.遮挡可重复进行
 */

const difficultyRatios = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
const sudoku = new SudoKu(); // 数独
const blankArrs = new Map(); // 空白答案填入值存储
let correctArrs = new Map(); // 记录正确答案的集合

const Board = ({ difficultyLeve = 0 }) => {
  const [btnDisabled, setBtnDisb] = useState(false); // 生成按钮是否可点击控制
  const [array, setSudoArr] = useState(null); // 生成的数独原数组
  const [fullArr, setFullArr] = useState(null); // 备份的原数据
  const [pass, setPass] = useState(false); // 验证是否通过

  /**
   * 难度系数
   * @param {number} difficultyLeve
   */
  const getDifficultyRatios = (difficultyLeve) => {
    if (difficultyRatios.length - 1 < difficultyLeve) {
      return difficultyRatios[difficultyRatios.length - 1];
    } else if (difficultyLeve < 0) {
      return difficultyRatios[0];
    }

    return difficultyRatios[difficultyLeve];
  };

  /**
   * 生成数独
   */
  const handleGenerateSudoku = () => {
    if (btnDisabled) {
      return;
    }

    blankArrs.clear();
    correctArrs.clear();

    setBtnDisb(true);
    setSudoArr(null);

    // 基于模板生成数独法
    const t0 = window.performance.now();
    const fullArr = sudoku.generate();
    const t1 = window.performance.now();
    console.log("高效方法耗时：", t1 - t0);
    console.log("生成的数独：", fullArr);
    setFullArr(fullArr);

    // 穷举生成数独法
    // const t2 = window.performance.now();
    // state.fullArr = this.sudoku.generate(false);
    // const t3 = window.performance.now();
    // console.log("穷举方法耗时：", t3 - t2);
    // console.log("生成的数独：", state.fullArr);

    // 难度系数
    const difficultyRatio = getDifficultyRatios(difficultyLeve);
    // 按难度系数随机遮挡
    const shelters = sudoku.shelter(fullArr, difficultyRatio);
    // 保存正确答案
    correctArrs = shelters.removes;
    // 展示遮挡之后的数独
    setSudoArr(shelters.sheltered);
    setBtnDisb(false);
  };

  const showAnswers = () => {
    setSudoArr(fullArr);
  };

  const check = () => {
    let correct = 0;
    for (let item of correctArrs.entries()) {
      const [key, value] = [item[0], item[1]];
      const ans = blankArrs.get(key);
      if (ans === value) {
        correct++;
      }
    }
    if (correct === correctArrs.size) {
      alert("验证成功！");
    }
  };

  const handleChange = (e, row, col) => {
    const elm = e.target;
    const value = Number(elm.innerText);

    console.log(123)

    if (isNaN(value) || value <= 0 || value > 9) {
      elm.innerText = "";
      blankArrs.delete(`${row},${col}`);
    } else {
      blankArrs.set(`${row},${col}`, value);
    }

    if (blankArrs.size === correctArrs.size) {
      setPass(true);
    } else {
      setPass(false);
    }
  };

  useEffect(() => {
    handleGenerateSudoku();
  }, [btnDisabled]);


  return (
    <div className="container">
      {array === null ? (
        <div>正在生成...</div>
      ) : (
        <div className="board">
          {array.map((row, i) => (
            <div className="row" key={`row-${i}`}>
              {row.map((col, j) => {
                const isShow = col !== null;
                const num = isShow ? col : "";
                const className = isShow ? "show" : "";
                return (
                  <pre
                    key={`box-${j}`}
                    className={className}
                    data-coordinate={[i, j]}
                    contentEditable={!isShow}
                    suppressContentEditableWarning
                    onInput={(e) => handleChange(e, i, j)}
                  >
                    {num}
                  </pre>
                );
              })}
            </div>
          ))}
          <div className="btn-group">
            <button onClick={handleGenerateSudoku} disabled={btnDisabled}>
              重新生成
            </button>
            <button onClick={check} disabled={!pass}>
              验证
            </button>
            <button onClick={showAnswers}>显示正确结果</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;
