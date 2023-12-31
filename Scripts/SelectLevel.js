// AZJIO 13.10.2019 Обновил 5 раз
//
// Description(1033): Selects the text between operators () [] {} "" ', and the re-call extends the selection until the next nesting level.
// Description(1049): Выделяет текст между операторами ( ) [ ] { } " " ' ', причём повторный вызов расширяет выделение до следующего уровня вложения.
//
// Usage:
//   Call("Scripts::Main", 1, "SelectLevel.js")

var hEditWnd = AkelPad.GetEditWnd();
var hMainWnd = AkelPad.GetMainWnd();
var oSys = AkelPad.SystemFunction();
var nSelStart = AkelPad.GetSelStart();
var nSelEnd = AkelPad.GetSelEnd();

if (nSelStart == 0) {
	WScript.Quit();
}

// Установи "nearestbr.selto_flags=1" в файле XBrackets.ini, чтобы начинать захват сразу со скобками/кавычками
if (nSelStart == nSelEnd) {
	AkelPad.Call("XBrackets::SelToNearestBrackets");
	WScript.Quit();
}

var sEditFile = AkelPad.GetEditFile(0);
var sFileExt = AkelPad.GetFilePath(sEditFile, 4 /*CPF_FILEEXT*/ );

// var pStartText=AkelPad.GetTextRange(0, nSelStart);
// var pEndText=AkelPad.GetTextRange(nSelEnd, -1);

switch (sFileExt.toLowerCase()) {

// эти (xml, html) практически не работают, надо писать индивидуальный алгоритьм
	case "xml":
	case "htm":
	case "html":
		/*
		aStart = ["<"];
		aStart = [">"];
		*/
		aStart = ["<", ">", '"', "'"]; // выделяет не тексты, а теги
		aStart = [">", "<", '"', "'"];
		break;

	default:
		/*
		aStart = '(,{,[,"'.split(',')
		aEnd = '),},],"'.split(',')
		*/
		aStart = ["(", "{", "[", '"', "'"];
		aEnd = [")", "}", "]", '"', "'"];
		break;
}

var nPosAll = [[0, 0, nSelStart],
[0, 0, nSelStart],
[0, 0, nSelStart],
[0, 0, nSelStart],
[0, 0, nSelStart],
[0, 0, nSelStart]];

var nStartPos2 = 0;
var nEndPos2 = 0;
var nEndPos = 0
var nStartPosTmp = 0;
var nStartPos = 0;
var idx = -1;


SetRedraw(hEditWnd, false);
var nFirstLine = saveLineScroll(hEditWnd);
Search()
function Search() {
	for (var j = 0; j <= 7; j++) { // сколько раз ищем скобки выше и выше. Ведь выше стоящие скобки могут быть одноуровневые и скрипт никогда не захватит выше.
		for (var i = 0; i <= aStart.length; i++) {
		// WScript.Echo(i);
			if (nPosAll[i][2] ==  -1) { // если 
				continue;
			}
			AkelPad.SetSel(nPosAll[i][2], nSelEnd); // возвращаем выделение
			nStartPos = AkelPad.TextFind(hEditWnd, aStart[i], 0x00100000 + 0x80000000); // FRF_UP + FRF_TEST - ищем вверх парный оператор
			nPosAll[i][2] = nStartPos;
		// WScript.Echo(nStartPos);
			if (nStartPos ==  -1) { // если 
				continue;
			}
			nEndPos = GetPos(nStartPos); // ищем парный оператор
			// WScript.Echo('шаг = ' + i + '\n' + nStartPos + '\n' + nEndPos);
			if (nEndPos < nSelEnd || nEndPos == -1) { // если закрывающий оператор-скобка не вышла за пределы выделенного, то игнор
				continue;
			} else {
				// nStartPos2 = nStartPos; // кэшируем валидные операторы
				// nEndPos2 = nEndPos;
				nPosAll[i][0] = nStartPos; // кэшируем валидные операторы
				nPosAll[i][1] = nEndPos;
		// WScript.Echo('валидные = ' + nStartPos + '\n' + nEndPos);
		// WScript.Echo('валидные = ' + nPosAll[i][0] + '\n' + nPosAll[i][1]);
				// WScript.Echo(nPosAll[i][0] + '\n' + nPosAll[i][1]);
			}
		
			if (nStartPosTmp < nStartPos) {
				nStartPosTmp = nStartPos
				idx = i;
			}
		};
		if (idx > -1) {
			return
		}
	};
};

// WScript.Echo('idx = ' + idx);
if (idx > -1) { // nStartPos не подразумевает 0, так как это выделить всё
	if (nPosAll[idx][0] !== -1 && nPosAll[idx][1] !== -1) {
		// WScript.Echo(nPosAll[idx][0] + '\n' + nPosAll[idx][1]);
		// AkelPad.SetSel(nPosAll[i][0] + 1, nPosAll[i][1]); // без захвата разделителя
		AkelPad.SetSel(nPosAll[idx][0], nPosAll[idx][1] + 1); // с захватом разделителя
	}
} else {
AkelPad.SetSel(nSelStart, nSelEnd);
}
restoreLineScroll(hEditWnd, nFirstLine);
SetRedraw(hEditWnd, true);

function GetPos(Pos) {
	var lpBuffer;
	var a;
	var s = "";
	AkelPad.SetSel(Pos, Pos); // курсор в начало скобки/кавычки, чтобы найти пару

	if (lpBuffer = AkelPad.MemAlloc(64 * _TSIZE)) {
		var res;

		res = AkelPad.Call("XBrackets::SelToMatchingBracket", 1, lpBuffer);
		if (res > 0) {
			s = AkelPad.MemRead(lpBuffer, _TSTR);
		}

		AkelPad.MemFree(lpBuffer);
	}

	a = s.split(" ");
	if (a.length == 3) {
		// WScript.Echo("pos1 = " + a[0] + "\npos2 = " + a[1] + "\nbrackets = " + a[2]);
		return parseInt(a[1])
	}
	return -1
}

function SendMessage(hWnd, uMsg, wParam, lParam) {
	return oSys.Call("User32::SendMessage" + _TCHAR, hWnd, uMsg, wParam, lParam);
}

function SetRedraw(hWnd, bRedraw)
{
  SendMessage(hWnd, 11 /*WM_SETREDRAW*/, bRedraw, 0);
  bRedraw && oSys.Call("User32::InvalidateRect", hWnd, 0, true);
}

// From Instructor's SearchReplace.js
function saveLineScroll(hWnd)
{
	AkelPad.SendMessage(hWnd, 11 /*WM_SETREDRAW*/, false, 0);
	return AkelPad.SendMessage(hWnd, 3129 /*AEM_GETLINENUMBER*/, 4 /*AEGL_FIRSTVISIBLELINE*/, 0);
}
function restoreLineScroll(hWnd, nBeforeLine)
{
	if (AkelPad.SendMessage(hWnd, 3129 /*AEM_GETLINENUMBER*/, 4 /*AEGL_FIRSTVISIBLELINE*/, 0) != nBeforeLine)
	{
		var lpScrollPos;
		var nPosY=AkelPad.SendMessage(hWnd, 3198 /*AEM_VPOSFROMLINE*/, 0 /*AECT_GLOBAL*/, nBeforeLine);

		if (lpScrollPos=AkelPad.MemAlloc(_X64?16:8 /*sizeof(POINT64)*/))
		{
			AkelPad.MemCopy(lpScrollPos + 0 /*offsetof(POINT64, x)*/, -1, 2 /*DT_QWORD*/);
			AkelPad.MemCopy(lpScrollPos + (_X64?8:4) /*offsetof(POINT64, y)*/, nPosY, 2 /*DT_QWORD*/);
			AkelPad.SendMessage(hWnd, 3180 /*AEM_SETSCROLLPOS*/, 0, lpScrollPos);
			AkelPad.MemFree(lpScrollPos);
		}
	}
	AkelPad.SendMessage(hWnd, 3377 /*AEM_UPDATECARET*/, 0, 0);
	AkelPad.SendMessage(hWnd, 11 /*WM_SETREDRAW*/, true, 0);
	oSys.Call("user32::InvalidateRect", hWnd, 0, true);
}