package az.achiqyol.entity.entities;
import jakarta.persistence.*; import lombok.*; @Entity @Table(name="users") @Getter @Setter @NoArgsConstructor public class User { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; private String name; private String email; }
