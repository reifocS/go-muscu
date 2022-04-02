import { useStore } from "~/store";

function App() {
  const start = useStore((state) => state.startDate);
  const end = useStore((state) => state.endDate);
  const nextMonth = useStore((state) => state.nextMonth);
  const prevMonth = useStore((state) => state.prevMonth);
  const dayInMonth = start.daysInMonth();

  return (
    <div className="w-full">
      <div className="flex flex-1"></div>
      <h1>Calendar</h1>
      <p>{`${start}-${end}`}</p>
      <button onClick={prevMonth}>prevMonth</button>
      <button onClick={nextMonth}>nextMonth</button>
      <table
        className="w-full"
        cellSpacing="21" cellPadding="21">
        <thead>
          <tr>
            <th>Sun</th>
            <th>Mon</th>
            <th>Tue</th>
            <th>Wed</th>
            <th>Thu</th>
            <th>Fri</th>
            <th>sat</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>1</td>
            <td>2</td>
          </tr>
          <tr></tr>
          <tr>
            <td>3</td>
            <td>4</td>
            <td>5</td>
            <td>6</td>
            <td>7</td>
            <td>8</td>
            <td>9</td>
          </tr>
          <tr>
            <td>10</td>
            <td>11</td>
            <td>12</td>
            <td>13</td>
            <td>14</td>
            <td>15</td>
            <td>16</td>
          </tr>
          <tr>
            <td>17</td>
            <td>18</td>
            <td>19</td>
            <td>20</td>
            <td>21</td>
            <td>22</td>
            <td>23</td>
          </tr>
          <tr>
            <td>24</td>
            <td>25</td>
            <td>26</td>
            <td>27</td>
            <td>28</td>
            <td>29</td>
            <td>30</td>
          </tr>
          <tr>
            <td>31</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
            <td>4</td>
            <td>5</td>
            <td>6</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default App;
