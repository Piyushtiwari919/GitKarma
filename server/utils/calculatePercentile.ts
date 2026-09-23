interface UserData {
  _id: number;
  userCount: number;
}

function calculatePercentile(arr: UserData[]): number[] {
  let totalUsersCount = 0;
  for (const obj of arr) {
    totalUsersCount += obj.userCount;
  }

  let percentileArray: number[] = new Array(101);
  let k: number = 0;
  let userCountAfterEachIteration: number = 0;

  for (let i = 0; i < 101; i++) {
    if (k < arr.length && arr[k]._id === i) {
      percentileArray[i] =
        ((userCountAfterEachIteration + arr[k].userCount) / totalUsersCount) *
        100;
      userCountAfterEachIteration += arr[k].userCount;
      k++;
    } else {
      percentileArray[i] =
        (userCountAfterEachIteration / totalUsersCount) * 100;
    }
  }
  return percentileArray;
}

export { calculatePercentile, UserData };
