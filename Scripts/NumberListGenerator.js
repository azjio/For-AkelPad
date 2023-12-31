// AZJIO, 03.09.2019
// Description(1033): Number List Generator. Select a few lines and use a script
// Description(1049): Генератор числового списка. Выделите несколько строк и используйте скрипт.
//
// Usage:
//   Call("Scripts::Main", 1, "NumberListGenerator.js")
// Примечание:
// Вставка определяется выделением, начало выделения - колонка вставки, число строк по количеству выделенного. Не обязательно выделять столбиком.
// Для дробных чисел точку можно ввести позже столбиком.
// Если указать число строк, то вставляется список в начало строк, сдвигая текст
if(!AkelPad.Include("InputBox_function.js")) WScript.Quit();

var hMainWnd = AkelPad.GetMainWnd();
var hEditWnd = AkelPad.GetEditWnd();
var oSys = AkelPad.SystemFunction();
var nSelStart = AkelPad.GetSelStart();
var nSelEnd = AkelPad.GetSelEnd();

var sLng = AkelPad.GetLangId(0 /*LANGID_FULL*/ );
if(sLng == 1049) // Русский
{
	var vLabel = ["Начало отсчёта:", "Шаг (-1 уменьшает):", "Колонка:", "Ширина:", "Число строк (игнор колонки и выдел.):"];
	// var vSet = "NumberListGenerator";
	var vMsgBox = "Выделите несколько строк!\n\nНачало выделения определяет колонку\nКонец выделения - строку до которой заполнение";
}
else // English
{
	var vLabel = ["Start", "Step (-1 decreases)", "Column", "Width", "Lines (ignore column and selected)"];
	// var vSet = "NumberListGenerator";
	var vMsgBox = "Select some lines!\n\nThe beginning of the selection defines the column\nThe end of the selection is the line to which the filling";
}

if(nSelStart == nSelEnd)
	ExitError()

SetRedraw(hEditWnd, false); // чтобы не показывать происходящее и не тратить время и ресурсы и перерисовку

// Disable Word Wrap Отключить перенос строк, если включен
var nWordWrap = SendMessage(hEditWnd, 3241 /*AEM_GETWORDWRAP*/ , 0, 0);
if(nWordWrap > 0) // Если перенос включен, то переключаем
	AkelPad.Command(4209 /*IDM_VIEW_WORDWRAP*/ );

// Получить номера строк по позиции
var nLineStart = SendMessage(hEditWnd, 1078 /*EM_EXLINEFROMCHAR*/ , 0, nSelStart);
var nLineEnd = SendMessage(hEditWnd, 1078 /*EM_EXLINEFROMCHAR*/ , 0, nSelEnd);
if(nLineStart == nLineEnd)
	ExitError()

BeginUndoAction() // Начало действия функции "Отмена". Все что произойдёт до StopUndoAction будет отменено одним кликом (взял из SwapText.js автора Kley)

var nIndent = nSelStart - GetBeginLine(nLineStart); // Определяем отступ
var nPos; // позиция

var vRetVal = InputBox(
	hMainWnd,
	"NumberListGenerator",
	vLabel, ["1", "1", nIndent + "", "1", "0"]);
if(vRetVal == undefined)
	ExitError2()

var nNum = Number(vRetVal[0]); // старт
var nStep = Number(vRetVal[1]); // шаг
nIndent = parseInt(vRetVal[2]); // колонка, отступ справа
var nWidth = parseInt(vRetVal[3]); // увеличение или уменьшение
if(nWidth <= 1)
	nWidth = 0;
var nLines = parseInt(vRetVal[4]); // Число строк
if(nLines) {
	var nRes = "";
	for(var i = nLineStart; i <= (nLineStart + nLines - 1); i++) {
		if(nWidth) {
			nRes += (NumWidth(nNum, nWidth) + "\n");
		}
		else {
			nRes += (nNum + "\n");
		}
		nNum += nStep;
	}
	AkelPad.SetSel(nSelStart, nSelStart);
	AkelPad.ReplaceSel(nRes);
	ExitError2()
}

for(var i = nLineStart; i <= nLineEnd; i++) {
	if(GetLineLength(i) >= nIndent) { // если длина строки больше отступа или равна то добавляем число
		nPos = GetBeginLine(i) + nIndent // позиция вставки от начало документа (начало строки + отступ)
		AkelPad.SetSel(nPos, nPos);
		if(nWidth) {
			AkelPad.ReplaceSel(NumWidth(nNum, nWidth));
		}
		else {
			AkelPad.ReplaceSel(nNum);
		}
		nNum += nStep;
	}
}

RecoveryWordWrap();
SetRedraw(hEditWnd, true);
StopUndoAction() // Конец действия функции "Отмена"

function RecoveryWordWrap() {
	if(nWordWrap > 0) { // Восстанавливаем перенос строк, если был включен
		AkelPad.Command(4209 /*IDM_VIEW_WORDWRAP*/ );
		SendMessage(hEditWnd, 3377 /*AEM_UPDATECARET*/ , 0, 0);
	}
}

// Если игнорировать дробные числа, то функцию можно упростить, убрав 2 первых строки (аналогично и ранее в цикле)
function NumWidth(n, w) {
	n = n.toPrecision(6) // Срезаем числа типа 1.2000000000000001 неверно переводимые в строки
	n = Number(n) // Снова в число чтобы откинуть нули
	n = n.toString(); // В строку
	if(n.length < w) {
		w -= n.length
		for(var i = 1; i <= w; i++) {
			n = "0" + n;
		}
	}
	return n
}

function ExitError() {
	RecoveryWordWrap();
	SetRedraw(hEditWnd, true);
	AkelPad.MessageBox(hMainWnd, vMsgBox, "NumberListGenerator.js", 48);
	WScript.Quit();
}

function ExitError2() {
	RecoveryWordWrap();
	StopUndoAction()
	SetRedraw(hEditWnd, true);
	WScript.Quit();
}

function SetRedraw(hWnd, bRedraw) {
	SendMessage(hWnd, 11 /*WM_SETREDRAW*/ , bRedraw, 0);
	bRedraw && oSys.Call("User32::InvalidateRect", hWnd, 0, true);
}

function SendMessage(hWnd, uMsg, wParam, lParam) {
	return oSys.Call("User32::SendMessage" + _TCHAR, hWnd, uMsg, wParam, lParam);
}

function GetLineLength(nLine) {
	return SendMessage(hEditWnd, 193 /*EM_LINELENGTH*/ , SendMessage(hEditWnd, 187 /*EM_LINEINDEX*/ , nLine, 0), 0);
}

function GetBeginLine(nLine) {
	return SendMessage(hEditWnd, 187 /*EM_LINEINDEX*/ , nLine, 0);
}

function BeginUndoAction() {
	SendMessage(hEditWnd, 3080 /*AEM_STOPGROUPTYPING*/ , 0, 0);
	SendMessage(hEditWnd, 3081 /*AEM_BEGINUNDOACTION*/ , 0, 0);
}

function StopUndoAction() {
	SendMessage(hEditWnd, 3082 /*AEM_ENDUNDOACTION*/ , 0, 0);
	SendMessage(hEditWnd, 3080 /*AEM_STOPGROUPTYPING*/ , 0, 0);
}