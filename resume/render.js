// resume/data.json 을 읽어 이력서를 그린다. 형식은 docs/resume-design.md 참고.
// 배치는 Jake's Resume(개발자 이력서 LaTeX 템플릿)를 따른다 — 한 단, 가로줄 절 제목, 굵은 제목 + 오른쪽 날짜.
(function () {
  'use strict';

  // children 은 노드 또는 문자열
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      if (c == null || c === false) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  // 글 안의 **…** 는 굵게 — 숫자·성과만 짚는 데 쓴다 (항목당 한두 군데)
  function rich(t) {
    return String(t || '').split(/\*\*(.+?)\*\*/).map(function (part, i) {
      return i % 2 ? el('strong', { text: part }) : part;
    }).filter(function (part) { return part !== ''; });
  }

  function list(tag, cls, items) {
    return el(tag, cls ? { class: cls } : {}, items.map(function (t) { return el('li', {}, rich(t)); }));
  }

  // "2019-08" → "2019.08", null → "현재"
  function ym(v) { return v ? v.replace('-', '.') : '현재'; }

  // "2019-08" → 개월 수 (null 은 오늘)
  function months(v) {
    var d = new Date();
    var m = v ? v.split('-') : [d.getFullYear(), d.getMonth() + 1];
    return Number(m[0]) * 12 + Number(m[1]) - 1;
  }

  // 시작·끝 달을 모두 넣어 센 기간 → "1년 3개월"
  function duration(start, end) {
    var n = months(end) - months(start) + 1;
    if (!start || n < 1) return '';
    var y = Math.floor(n / 12), m = n % 12;
    return (y ? y + '년' : '') + (y && m ? ' ' : '') + (m ? m + '개월' : '');
  }

  function section(title, body, cls) {
    return el('section', { class: 'sec' + (cls ? ' ' + cls : '') }, [el('h2', { text: title }), el('div', { class: 'sec-body' }, body)]);
  }

  // 항목 머리 두 줄: [굵은 제목 | 기울임 부가] ··· [오른쪽 날짜], [기울임 왼쪽] ··· [기울임 오른쪽]
  function entryHead(title, extra, right, sub, subRight) {
    return [
      el('div', { class: 'row' }, [
        el('h3', {}, [title, extra ? el('span', { class: 'extra' }, [el('span', { class: 'bar', text: '|' }), el('em', { text: extra })]) : null]),
        right ? el('span', { class: 'date', text: right }) : null
      ]),
      sub || subRight ? el('div', { class: 'row sub' }, [el('em', { text: sub || '' }), subRight ? el('em', { text: subRight }) : null]) : null
    ];
  }

  function profile(p) {
    var c = p.contact || {};
    var items = [];
    if (p.nameEn) items.push(el('span', { text: p.nameEn }));
    // 이메일은 쉼표로 여러 개 적을 수 있다
    (c.email || '').split(',').map(function (m) { return m.trim(); }).filter(Boolean).forEach(function (m) {
      items.push(el('a', { href: 'mailto:' + m, text: m }));
    });
    if (c.phone) {
      // 가린 번호(010-****-…)는 전화 링크를 만들지 않는다 (D-008)
      items.push(/\*/.test(c.phone) ? el('span', { text: c.phone }) : el('a', { href: 'tel:' + c.phone.replace(/[^+\d]/g, ''), text: c.phone }));
    }
    if (c.github) items.push(el('a', { href: c.github, text: c.github.replace(/^https?:\/\//, '').replace(/\/$/, '') }));
    var line = [];
    items.forEach(function (n, i) { if (i) line.push(el('span', { class: 'sep', text: '|' })); line.push(n); });
    return el('header', { class: 'profile' }, [
      el('h1', { text: p.name }),
      el('p', { class: 'contact' }, line),
      // 요약: 첫 줄은 한 문장 자기 규정, 나머지는 근거 — 채용 담당자가 첫 화면에서 읽는 부분
      p.summary && p.summary.length ? el('div', { class: 'summary' }, p.summary.map(function (t, i) {
        return el('p', { class: i ? '' : 'lead' }, rich(t));
      })) : null
    ]);
  }

  function project(pr) {
    var bullets = [];
    if (pr.summary) bullets.push(el('li', {}, rich(pr.summary)));
    // 역할이 유형과 같으면(예: 「| AA」 + 「역할: AA」) 머리줄에 이미 있으니 다시 적지 않는다
    if (pr.role && pr.role !== pr.type) bullets.push(el('li', {}, [el('b', { text: '역할: ' })].concat(rich(pr.role))));
    return el('article', { class: 'entry' + (pr.end ? '' : ' current') }, entryHead(
      pr.title,
      pr.type || '',
      ym(pr.start) + ' – ' + ym(pr.end),
      pr.tech && pr.tech.length ? pr.tech.join(', ') : '',
      pr.end ? duration(pr.start, pr.end) : '진행 중'
    ).concat([bullets.length ? el('ul', { class: 'items' }, bullets) : null]));
  }

  // 오래된 프로젝트는 한 줄로 — 끝난 지 OLD_YEARS 년이 넘으면 「이전 프로젝트」 목록에 제목·기술·기간만
  var OLD_YEARS = 12;
  function isOld(pr) { return pr.end && months(null) - months(pr.end) >= OLD_YEARS * 12; }

  function compact(prs) {
    return el('div', { class: 'older' }, [
      el('h3', { class: 'older-title', text: '이전 프로젝트' }),
      el('ul', { class: 'compact' }, prs.map(function (pr) {
        return el('li', { class: 'row' }, [
          el('span', {}, [el('b', { text: pr.title }), pr.tech && pr.tech.length ? el('em', { text: ' · ' + pr.tech.join(', ') }) : null]),
          el('span', { class: 'date', text: ym(pr.start) + ' – ' + ym(pr.end) })
        ]);
      }))
    ]);
  }

  function projects(prs) {
    var recent = prs.filter(function (pr) { return !isOld(pr); });
    var old = prs.filter(isOld);
    return recent.map(project).concat(old.length ? [compact(old)] : []);
  }

  function troubleshooting(c, i) {
    var rows = [['문제', c.problem], ['원인', c.cause], ['해결', c.solution], ['결과', c.result]];
    return el('article', { class: 'entry' }, entryHead((i + 1) + '. ' + c.title, c.project || '').concat([
      el('ul', { class: 'items' }, rows.filter(function (r) { return r[1] && r[1].length; }).map(function (r) {
        return el('li', {}, [el('b', { text: r[0] }), list('ul', 'sub-items', r[1])]);
      }))
    ]));
  }

  // 보유 기술: group 이 같은 것끼리 한 줄 — 「Backend  Java, NodeJS」. 설명은 마우스를 올리면 보인다
  function skills(list_) {
    var groups = [], by = {};
    list_.forEach(function (s) {
      var g = s.group || '기타';
      if (!by[g]) { by[g] = []; groups.push(g); }
      by[g].push(s);
    });
    return el('dl', { class: 'skill-groups' }, groups.reduce(function (acc, g) {
      acc.push(el('dt', { text: g }), el('dd', {}, by[g].map(function (s, i) {
        return el('span', s.description ? { title: s.description } : {}, [(i ? ', ' : '') + s.name]);
      })));
      return acc;
    }, []));
  }

  function work(w) {
    return el('article', { class: 'entry' }, entryHead(w.title, w.type || '').concat([list('ul', 'items', w.description || [])]));
  }

  function render(d) {
    var app = document.getElementById('app');
    var p = d.profile || {};
    var pf = d.portfolio || {};
    var hasCases = pf.troubleshooting && pf.troubleshooting.length;
    document.title = (p.name || '') + '_이력서'; // PDF 로 저장할 때 기본 파일 이름이 된다
    app.textContent = '';
    [
      profile(p),
      p.intro && p.intro.length ? section('소개', [el('div', { class: 'intro' }, p.intro.map(function (t) { return el('p', { text: t }); }))]) : null,
      d.goals && d.goals.length ? section('목표 및 포부', [list('ul', 'items', d.goals)]) : null,
      d.skills && d.skills.length ? section('보유 기술', [skills(d.skills)]) : null,
      d.certifications && d.certifications.length ? section('자격', [el('p', { class: 'certs', text: d.certifications.join(' · ') })]) : null,
      d.projects && d.projects.length ? section('프로젝트 이력', projects(d.projects), 'page-start') : null,
      hasCases ? section('문제 해결 사례', pf.troubleshooting.map(troubleshooting), 'portfolio portfolio-start') : null,
      pf.works && pf.works.length ? section('개인 개발', pf.works.map(work), 'portfolio' + (hasCases ? '' : ' portfolio-start')) : null,
      d.updated ? el('footer', { text: '최종 수정 ' + d.updated }) : null
    ].forEach(function (n) { if (n) app.appendChild(n); });
  }

  // 도구 막대: PDF 다운로드(서버에서 미리 만든 파일 — scripts/build-pdf.mjs), 인쇄, 포트폴리오 포함 여부
  var toggle = document.getElementById('with-portfolio');
  var pdf = document.getElementById('pdf');
  if (toggle) {
    toggle.addEventListener('change', function () {
      document.body.classList.toggle('no-portfolio', !toggle.checked);
      if (pdf) {
        pdf.href = toggle.checked ? 'pdf/resume.pdf' : 'pdf/resume-only.pdf';
        pdf.download = toggle.checked ? '송강민_이력서.pdf' : '송강민_이력서_요약.pdf';
      }
    });
  }
  var printBtn = document.getElementById('print');
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

  fetch('data.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(function (e) {
      document.getElementById('app').textContent = '이력서 데이터를 불러오지 못했습니다 (' + e.message + ').';
    });
})();
