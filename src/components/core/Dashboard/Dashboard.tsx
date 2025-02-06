import { useEffect, useState } from "react";
import { getDashboardData } from "../../../services/operations/userAPI";
import { FaBoxOpen } from "react-icons/fa6";
import { FaRupeeSign } from "react-icons/fa";
import { LuTriangleAlert } from "react-icons/lu";
import Loader from "../../common/Loader";
import { RootState } from "../../../reducer/store";
import { useSelector } from "react-redux";

interface DashboardData {
  borrowedItemsCount: number;
  lentItemsCount: number;
  totalProfit: number;
  pendingReturns: number;
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>(
    {} as DashboardData
  );

  const { token } = useSelector((state: RootState) => state.user);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      return;
    }

    const getDashboard = async () => {
      try {
        const res = await getDashboardData();

        setDashboardData(res);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getDashboard();
  }, []);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="flex flex-col mt-5 gap-5">
          <div
            className={`grid grid-cols-4 gap-5 max-[1180px]:grid-cols-2 max-[740px]:grid-cols-1`}
          >
            <div className="flex flex-col justify-between p-5 rounded-lg border border-neutral-300 gap-2 shadow-md">
              <div className="flex justify-between w-full items-center">
                <span className="text-sm font-medium">
                  Total Items Borrowed
                </span>
                <FaBoxOpen />
              </div>
              <div className="font-bold text-3xl">
                {dashboardData.borrowedItemsCount || 0}
              </div>
            </div>
            <div className="flex flex-col justify-between p-5 rounded-lg border border-neutral-300 gap-2 shadow-md">
              <div className="flex justify-between w-full items-center">
                <span className="text-sm font-medium">Total Items Lent</span>
                <FaBoxOpen />
              </div>
              <div className="font-bold text-3xl">
                {dashboardData.lentItemsCount || 0}
              </div>
            </div>
            <div className="flex flex-col justify-between p-5 rounded-lg border border-neutral-300 gap-2 shadow-md">
              <div className="flex justify-between w-full items-center">
                <span className="text-sm font-medium">Pending Returns</span>
                <LuTriangleAlert />
              </div>
              <div className="font-bold text-3xl">
                {dashboardData.pendingReturns || 0}
              </div>
            </div>
            <div className="flex flex-col justify-between p-5 rounded-lg border border-neutral-300 gap-2 shadow-md">
              <div className="flex justify-between w-full items-center">
                <span className="text-sm font-medium">Total Profit</span>
                <FaRupeeSign />
              </div>
              <div className="font-bold text-3xl">
                {dashboardData.totalProfit || 0}
              </div>
            </div>
          </div>
          <div>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iure eos,
            fugiat quae eligendi eius porro? Voluptatem repudiandae sunt magnam!
            Nostrum voluptatum voluptatem, facere consequuntur asperiores
            exercitationem sint ratione! Quas qui natus minima recusandae
            tempore aliquam voluptas reprehenderit quia quisquam inventore
            quaerat corrupti beatae ratione aperiam ut rerum voluptatibus
            voluptatum sit, rem neque ex veniam ea delectus. Modi dolores
            laborum sit quos quia similique quod tenetur non. Corporis hic
            consectetur quaerat, rem libero iusto quibusdam, ratione cupiditate
            odio veniam ab atque expedita labore porro, incidunt dolore. Sed
            natus, quis vitae earum officia amet dolorem facilis excepturi saepe
            nisi ratione soluta, repellat iste error quia sunt odit ab? Tenetur,
            repellat. Ullam facere cumque eveniet optio provident nam quo porro,
            corporis eaque, nostrum, dolor tempora officia culpa libero
            distinctio quibusdam voluptatibus! Ad, harum, commodi omnis
            voluptatibus doloribus ab earum doloremque inventore pariatur,
            similique provident obcaecati. Ipsum placeat repudiandae esse
            impedit ratione aliquam repellendus distinctio ipsa expedita ex
            odit, illo excepturi praesentium! In quas nulla, ipsa voluptatum
            sunt nihil mollitia dolores id facere porro adipisci nostrum,
            temporibus iste culpa quod odit hic laudantium reprehenderit dolorem
            consequatur aut maxime. Doloribus recusandae, tempore odio id
            blanditiis minus suscipit totam sunt, quod vero reprehenderit saepe
            amet, nemo et earum distinctio similique illum! Natus, neque rerum
            hic in ipsa vel, porro fugiat aspernatur debitis rem nobis. Ea
            consequuntur distinctio dolorum in quidem molestiae voluptatem,
            natus exercitationem laudantium accusamus fugiat dignissimos saepe
            commodi temporibus totam corporis repellendus! Reprehenderit
            necessitatibus repudiandae, doloribus incidunt corrupti harum qui.
            Impedit voluptas, sapiente non, voluptatibus veritatis sit minus
            deleniti, officia quasi sint nostrum commodi totam ducimus tenetur
            ipsum necessitatibus atque magnam labore quis provident laboriosam!
            Ratione tempore vero eaque quo rerum minus commodi! Omnis nobis
            consequatur non earum magni laborum eaque officiis facilis velit
            eligendi officia quisquam necessitatibus quidem iste ipsum
            doloremque obcaecati vel distinctio exercitationem, tenetur, fugit
            praesentium laudantium repellat. Reiciendis possimus, debitis neque
            vero velit enim hic quos ad mollitia voluptatum et accusamus. Omnis
            sed nisi, soluta accusamus eligendi maiores quidem nostrum
            laudantium beatae voluptatem vero quibusdam itaque nesciunt
            veritatis accusantium excepturi, iure quam quis? Enim harum
            blanditiis doloribus inventore porro similique, voluptates dolorem
            cumque sed. Unde earum reiciendis eos eaque amet molestias nihil
            perferendis ipsa quo culpa inventore, debitis maxime totam? Dolore
            recusandae dicta dolor autem deserunt reiciendis nemo repellat
            voluptatibus quibusdam, rem ullam quisquam quidem delectus, cum
            pariatur similique, voluptatum deleniti labore blanditiis rerum.
            Facere dolorum nostrum et dolorem quia explicabo sunt earum nisi,
            veniam necessitatibus dolores hic non amet eligendi cum eos! Cum ut
            non illum cupiditate obcaecati commodi. Consectetur animi, ullam
            repellat nesciunt distinctio eum. Sapiente dolore quae suscipit, ab,
            soluta quasi perferendis ullam dicta rem praesentium dolores
            consequuntur laborum sed dolorum magnam eveniet! Commodi sapiente
            vel delectus, laborum veritatis repellat dolore quisquam impedit ea
            ducimus accusantium. Odio placeat atque dolore itaque accusantium.
            Illo vel libero delectus, in, facere distinctio tenetur illum,
            tempore quia praesentium accusantium. Omnis blanditiis mollitia
            earum, consequuntur aliquam voluptate quasi odio exercitationem quas
            architecto dolor modi praesentium reiciendis inventore laudantium,
            accusantium et placeat veritatis suscipit! Hic nisi harum debitis
            earum reprehenderit ducimus adipisci sunt saepe dolor sit aspernatur
            a vitae provident corporis obcaecati error numquam magni eveniet
            nam, cupiditate, culpa libero eius id? Itaque perspiciatis ullam
            sint ab, facilis, est hic dicta laboriosam qui repudiandae eum
            dolore! Aliquid amet voluptate explicabo aspernatur laboriosam eius
            eveniet nesciunt veniam repudiandae suscipit ullam dicta iusto
            perferendis enim commodi autem nam ad neque accusantium cum,
            repellat natus! At ratione numquam accusantium ex recusandae
            accusamus doloremque esse assumenda, a corrupti. Quod, rerum
            consequuntur soluta amet ad eligendi? Quidem alias deleniti rem
            accusamus pariatur nesciunt ullam quaerat error officiis numquam
            rerum vero, ratione, reprehenderit totam! Ullam, ab, fugiat eos
            soluta corrupti voluptate consequatur ex corporis perferendis autem
            animi dignissimos inventore natus nam nesciunt? Omnis, autem. Odit
            fuga at delectus, id temporibus laudantium tempora? Expedita
            delectus similique incidunt nisi necessitatibus dolore tenetur, rem
            esse nulla sequi provident, officiis, cumque aliquid dignissimos.
            Omnis illum pariatur laborum corrupti unde, qui ut, impedit iure
            quidem quam dolorum, illo nam a fugit nostrum accusantium est
            molestiae! Repellat, deserunt at eligendi est alias pariatur
            distinctio iusto nobis exercitationem ab id temporibus nihil
            laboriosam esse, beatae obcaecati illum sint hic fuga, animi tempore
            tenetur! Alias magnam totam, doloribus blanditiis nostrum
            consequuntur officiis voluptatem atque laudantium itaque eveniet
            aliquid optio nam sed, quas obcaecati eum praesentium veritatis
            distinctio dignissimos perspiciatis quibusdam. Rem natus minima et
            reiciendis consequuntur sed perferendis optio vel illum magnam unde
            id provident tempora, dolore quibusdam sequi officiis voluptatum in
            blanditiis tempore eos? Nostrum fugit expedita veritatis labore odit
            optio repellendus ab quam ad quod. Doloremque iure ut corrupti sit
            dolore velit, vitae voluptates amet. Rem nemo at in architecto eos
            autem vero, a, veritatis fugiat voluptas minima enim necessitatibus
            molestiae aliquam corporis impedit qui aut ullam consectetur, ut
            nobis ex? Reiciendis ipsum ipsa ab quis fuga libero qui accusamus
            minima, eos sequi voluptatum, iusto autem, blanditiis molestias et!
            Iusto explicabo iste perferendis neque expedita magnam culpa
            veritatis repudiandae nam, voluptates non aliquam, atque illum dolor
            officia quasi quia laborum quo quae et, vitae molestiae sit tempora.
            Magnam nobis voluptatibus optio neque tenetur corporis unde minima
            eveniet nemo voluptas. Esse vitae veniam beatae! Quos sunt aliquid,
            laudantium necessitatibus fuga a adipisci numquam nostrum odio id.
            Dolore repellat totam ipsam provident aliquid magnam quia
            consequuntur quidem mollitia molestias aspernatur dicta sunt soluta
            harum alias iusto, sint dolor autem? Sed accusamus minima nihil
            facere at aut aliquid dolores ratione voluptatum est ex eaque ut
            beatae esse, magni animi ullam sint sequi eveniet, quisquam totam
            repellat modi voluptatem et. Libero debitis repellat obcaecati. Sit
            laudantium iusto blanditiis minima? Facere ut earum totam tenetur
            recusandae iste ipsam repellendus dolorum? In ipsa maxime unde
            laborum adipisci inventore alias recusandae. Temporibus architecto,
            similique eius iusto molestias consequuntur facilis vero amet velit
            accusantium nulla minima asperiores eum nam perferendis culpa atque
            rem? Rerum, cum. Rem earum iusto voluptas, voluptate culpa sapiente
            maiores saepe magnam, vero ex suscipit. Atque nostrum praesentium
            repellendus ullam placeat libero culpa officiis quas in, laborum,
            aperiam nisi expedita.
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
