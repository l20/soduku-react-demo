/**
 *
 * 数独类
 *
 * 两种生成数独的方式
 *
 * 高效的生成方式：
 * 用二维数组a表示，然后再生成一个乱序1-9的一维数组，用一维数组b表示。
 * 遍历这个a数组，在b中找到a数组中当前值所在的位置，然后将b数组中下一
 * 个位置的数字赋给a的当前值，目的是用b数组给a数组中的所有的值，循环
 * 的改变一下。中间的那个九宫格是1-9的顺序排列，第五行第五列都是有规律，
 * 然后一个九宫格一个九宫格的填充。
 *
 * 穷举法完全随机生成：
 * 从数字1开始，第一行，随机一个位置放1，第二行起，除了确定当前纵列没有1，
 * 每一个小九宫格也不应有1。数字1在每一行放置完后从第一行起放置2
 *
 * 参考：https://my.oschina.net/wangmengjun/blog/781984
 * 			https://www.zhihu.com/question/22043229
 * 			https://github.com/Kyubyong/sudoku
 *
 * @class
 * @memberof Sudoku
 * @extends null
 */
class Sudoku {
  /**
   * 穷举法生成成功标记
   *
   * @private
   */
  _generateSudokuSuccess = false;

  /**
   * 为了高效生成数独矩阵，使用一个编排好的横向和纵向都不重复的二维数组作为模版
   *
   * @readonly
   * @member {Array<Array<number>>}
   */
  get sudokuTemplate() {
    return [
      [3, 4, 1, 2, 9, 7, 6, 8, 5],
      [2, 5, 6, 8, 3, 4, 9, 7, 1],
      [9, 8, 7, 1, 5, 6, 3, 2, 4],
      [1, 9, 2, 6, 7, 5, 8, 4, 3],
      [8, 7, 5, 4, 2, 3, 1, 9, 6],
      [6, 3, 4, 9, 1, 8, 2, 5, 7],
      [5, 6, 3, 7, 8, 9, 4, 1, 2],
      [4, 1, 9, 5, 6, 2, 7, 3, 8],
      [7, 2, 8, 3, 4, 1, 5, 6, 9],
    ];
  }

  /**
   * 包含了两种生成数独方式的方法
   * @param {boolean} [efficient=true] - 是否使用模版高效生成
   * @returns {Array<Array<Number>>}
   */
  generate(efficient = true) {
    // 高效生成
    let sudokuArrs = [];
    if (efficient) {
      const randomList = this._creatNineRondomArray();
      sudokuArrs = this._creatSudokuByTemplate(this.sudokuTemplate, randomList);
    } else {
      // 穷举法随机生成
      while (!this._generateSudokuSuccess) {
        sudokuArrs = this._creatSudokuByRandom();
      }
    }
    return sudokuArrs;
	}
	
	/**
   * 生成遮挡之后的数独矩阵
	 * 
   * @param {boolean} [efficient=true] - 是否使用模版高效生成
   * @returns {object | void} -返回的数据
   * @return {Array<[]>} sheltered - 遮挡之后的数独矩阵
   * @return {Map} removes - 被遮挡的值
   */
	shelter(sudokuArrs, difficultyRatio = 0.1) {
		if (!Array.isArray(sudokuArrs)) {
			return;
		}

		const removes = new Map();
		const sheltered = sudokuArrs.map((row, i) =>
      row.map((col, j) => {
        const num = Math.random() >= difficultyRatio ? col : null;
        if (!num) {
          removes.set(`${i},${j}`, col);
        }
        return num;
      })
		);
		
		return { sheltered, removes };

	}

  /**
   * 生成从min到max的随机数
   *
   * @private
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {number} - 生成的随机数
   */
  _randomNum(min, max) {
    switch (arguments.length) {
      case 1:
        return parseInt(Math.random() * min + 1, 10);
      case 2:
        return parseInt(Math.random() * (max - min + 1) + min, 10);
      default:
        return 0;
    }
  }

  /**
   * 产生一个1-9的不重复长度为9的一维数组
   *
   * @private
   * @returns {Array<number>}
   */
  _creatNineRondomArray() {
    const list = new Array();
    for (let i = 0; i < 9; i++) {
      let randomNum = this._randomNum(1, 9);
      while (true) {
        if (!list.includes(randomNum)) {
          list.push(randomNum);
          break;
        }
        randomNum = this._randomNum(1, 9);
      }
    }
    return list;
  }

  /**
   * 通过一维数组和模版数组生成随机的数独矩阵
   * 遍历二维数组里的数据，在一维数组找到当前值的位置，并把一维数组
   * 当前位置加一处位置的值赋到当前二维数组中。目的是将一维数组为
   * 依据，按照随机产生的顺序，将这个9个数据进行循环交换，生成一个随
   * 机的数独矩阵。
   *
   * @private
   * @param {Array<[]>} sudokuTemplate - 种子矩阵
   * @param {Array<number>} randomList - 随机的数组
   * @returns {Array<[number]>} - 顺序打乱之后的数独矩阵
   */
  _creatSudokuByTemplate(sudokuTemplate, randomList) {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        for (let k = 0; k < 9; k++) {
          if (sudokuTemplate[i][j] == randomList[k]) {
            sudokuTemplate[i][j] = randomList[(k + 1) % 9];
            break;
          }
        }
      }
    }
    return sudokuTemplate;
  }

  /**
   * 每行分为3块，idx在三行内不处于同一块
   *
   * @private
   * @param {Array} rowList - 当前行的数字填充情况
   * @param {number} idxOfRowList - 数独第几行
   * @param {Array} idxInList - 同一数字在每行所处位置
   * @returns {Array<>}
   */
  _avalibleIdx(rowList, idxOfRowList, idxInList) {
    const avalibleList = [];
    // 循环数独当前行的每一个单元格，只有是undefined（没有数字填充）并且在已有的位置索引记录中不同于该位置（即排除相同列）继续
    for (let m = 0; m < 9; m++) {
      if (rowList[m] === undefined && idxInList.indexOf(m) === -1) {
        if (idxOfRowList % 3 === 0) {
          avalibleList.push(m);
        } else {
          let blockLastIndex = idxInList[idxInList.length - 1];
          if (
            (blockLastIndex < 3 && m < 3) ||
            (blockLastIndex >= 3 && blockLastIndex < 6 && m >= 3 && m < 6) ||
            (blockLastIndex >= 6 && m >= 6)
          ) {
            continue;
          } else {
            if (idxOfRowList % 3 === 2) {
              let blockAheadIdx = idxInList[idxInList.length - 2];
              if (
                (blockAheadIdx < 3 && m < 3) ||
                (blockAheadIdx >= 3 && blockAheadIdx < 6 && m >= 3 && m < 6) ||
                (blockAheadIdx >= 6 && m >= 6)
              ) {
                continue;
              }
            }
            avalibleList.push(m);
          }
        }
      }
    }

    let resultList = Array.from(new Set(avalibleList));
    return resultList[Math.floor(Math.random() * resultList.length)];
  }

  /**
   * 穷举法生成数独矩阵
   * 首先创建一个9x9二位数组array，如[[undefined, undefined, ...], [..], [..],...[..]]
   * array代表整个数独容器，array的第一个索引array[x]代表数独的每一行，array[x][y]表示每一个单元格，填充单个数字
   *
   * @private
   * @returns {Array<[]>} 数独矩阵
   */
  _creatSudokuByRandom() {
    const array = new Array(9);
    for (let i = 0; i < 9; i++) {
      array[i] = new Array(9);
    }

    let time = new Date().getTime();

    for (let j = 0; j < 9; j++) {
      let idxInList = [];
      let notComplete = true;

      while (notComplete) {
        idxInList = [];
        for (let k = 0; k < 9; k++) {
          let avalibIdx = this._avalibleIdx(array[k], k, idxInList);

          if (avalibIdx !== undefined) {
            idxInList.push(avalibIdx);
          }
        }

        if (idxInList.length === 9) {
          notComplete = false;
        } else if (new Date().getTime() - time > 1000) {
          return;
        }
      }

      for (let n = 0; n < idxInList.length; n++) {
        array[n][idxInList[n]] = j + 1;
        if (j === 8 && n === 8) {
          this._generateSudokuSuccess = true;
          return array;
        }
      }
    }
  }
}

export default Sudoku;
